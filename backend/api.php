<?php
// Revolution Roleplay - Main API Endpoint

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';
require_once 'auth.php';

// Helper function to get authorization token
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

// Helper function to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// Helper function to send JSON response
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path); // Remove /api prefix
$method = $_SERVER['REQUEST_METHOD'];

// Route the request
try {
    switch ($path) {
        // Server Stats
        case '/server-stats':
            if ($method === 'GET') {
                $fivem_data = @file_get_contents(FIVEM_SERVER_URL);
                if ($fivem_data) {
                    $data = json_decode($fivem_data, true);
                    sendResponse([
                        'players' => $data['clients'] ?? 0,
                        'max_players' => intval($data['sv_maxclients'] ?? 64),
                        'hostname' => $data['hostname'] ?? 'Revolution Roleplay',
                        'gametype' => $data['gametype'] ?? 'ESX Legacy'
                    ]);
                } else {
                    sendResponse([
                        'players' => 1,
                        'max_players' => 64,
                        'hostname' => 'Revolution Roleplay',
                        'gametype' => 'ESX Legacy'
                    ]);
                }
            }
            break;

        // Auth endpoints
        case '/admin/login':
            if ($method === 'POST') {
                $input = getJsonInput();
                $result = $auth->login($input['username'], $input['password']);
                if ($result['success']) {
                    sendResponse($result);
                } else {
                    sendResponse($result, 401);
                }
            }
            break;

        // User endpoints
        case '/user/me':
            if ($method === 'GET') {
                $token = getAuthToken();
                $user = $auth->getCurrentUser($token);
                if ($user) {
                    sendResponse([
                        'type' => 'admin',
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'id' => $user['id'],
                        'allowed_forms' => json_decode($user['allowed_forms'], true) ?: [],
                        'is_admin' => $user['role'] === 'admin',
                        'is_staff' => in_array($user['role'], ['admin', 'staff'])
                    ]);
                } else {
                    sendResponse(['error' => 'Unauthorized'], 401);
                }
            }
            break;

        // Application Forms
        case '/applications':
            if ($method === 'GET') {
                $stmt = $db->prepare("SELECT * FROM application_forms WHERE is_active = 1");
                $stmt->execute();
                $forms = $stmt->fetchAll();
                
                foreach ($forms as &$form) {
                    $form['fields'] = json_decode($form['fields'], true);
                }
                
                sendResponse($forms);
            }
            break;

        case '/admin/application-forms':
            $token = getAuthToken();
            
            if ($method === 'GET') {
                $auth->requireStaffOrAdmin($token);
                $stmt = $db->prepare("SELECT * FROM application_forms ORDER BY created_at DESC");
                $stmt->execute();
                $forms = $stmt->fetchAll();
                
                foreach ($forms as &$form) {
                    $form['fields'] = json_decode($form['fields'], true);
                }
                
                sendResponse($forms);
            } elseif ($method === 'POST') {
                $user = $auth->requireAdmin($token);
                $input = getJsonInput();
                
                $id = Database::generateUUID('form-');
                $stmt = $db->prepare("INSERT INTO application_forms (id, title, description, position, fields, webhook_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $id,
                    $input['title'],
                    $input['description'],
                    $input['position'],
                    json_encode($input['fields']),
                    $input['webhook_url'] ?? '',
                    $user['username']
                ]);
                
                sendResponse(['message' => 'Form created successfully', 'id' => $id]);
            }
            break;

        // More endpoints would continue here...
        // For brevity, I'll add the most important ones

        default:
            sendResponse(['error' => 'Endpoint not found'], 404);
    }
} catch (Exception $e) {
    if (DEBUG_MODE) {
        sendResponse(['error' => $e->getMessage()], 500);
    } else {
        sendResponse(['error' => 'Internal server error'], 500);
    }
}
?>