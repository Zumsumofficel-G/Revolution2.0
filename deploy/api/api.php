<?php
// Revolution Roleplay - Complete API Endpoints

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

// Helper functions
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Get request path and method
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Extract path segments
$segments = explode('/', trim($path, '/'));

try {
    // Route the request
    if ($path === '/server-stats' && $method === 'GET') {
        // FiveM Server Stats
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
    
    // Authentication
    elseif ($path === '/admin/login' && $method === 'POST') {
        $input = getJsonInput();
        $result = $auth->login($input['username'], $input['password']);
        if ($result['success']) {
            sendResponse($result);
        } else {
            sendResponse($result, 401);
        }
    }
    
    // Current User
    elseif ($path === '/user/me' && $method === 'GET') {
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
    
    // Public Application Forms
    elseif ($path === '/applications' && $method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM application_forms WHERE is_active = 1 ORDER BY created_at DESC");
        $stmt->execute();
        $forms = $stmt->fetchAll();
        
        foreach ($forms as &$form) {
            $form['fields'] = json_decode($form['fields'], true);
        }
        
        sendResponse($forms);
    }
    
    // Get specific application form
    elseif (preg_match('/^\/applications\/([^\/]+)$/', $path, $matches) && $method === 'GET') {
        $form_id = $matches[1];
        $stmt = $db->prepare("SELECT * FROM application_forms WHERE id = ? AND is_active = 1");
        $stmt->execute([$form_id]);
        $form = $stmt->fetch();
        
        if ($form) {
            $form['fields'] = json_decode($form['fields'], true);
            sendResponse($form);
        } else {
            sendResponse(['error' => 'Application not found'], 404);
        }
    }
    
    // Submit Application
    elseif ($path === '/applications/submit' && $method === 'POST') {
        $input = getJsonInput();
        
        // Verify form exists
        $stmt = $db->prepare("SELECT * FROM application_forms WHERE id = ? AND is_active = 1");
        $stmt->execute([$input['form_id']]);
        $form = $stmt->fetch();
        
        if (!$form) {
            sendResponse(['error' => 'Application form not found'], 404);
        }
        
        // Create submission
        $submission_id = Database::generateUUID('sub-');
        $stmt = $db->prepare("INSERT INTO application_submissions (id, form_id, applicant_name, responses) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $submission_id,
            $input['form_id'],
            $input['applicant_name'],
            json_encode($input['responses'])
        ]);
        
        sendResponse(['message' => 'Application submitted successfully', 'submission_id' => $submission_id]);
    }
    
    // Admin Application Forms Management
    elseif ($path === '/admin/application-forms' && $method === 'GET') {
        $token = getAuthToken();
        $auth->requireStaffOrAdmin($token);
        
        $stmt = $db->prepare("SELECT * FROM application_forms ORDER BY created_at DESC");
        $stmt->execute();
        $forms = $stmt->fetchAll();
        
        foreach ($forms as &$form) {
            $form['fields'] = json_decode($form['fields'], true);
        }
        
        sendResponse($forms);
    }
    
    elseif ($path === '/admin/application-forms' && $method === 'POST') {
        $token = getAuthToken();
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
    
    // Update/Delete specific application form
    elseif (preg_match('/^\/admin\/application-forms\/([^\/]+)$/', $path, $matches)) {
        $token = getAuthToken();
        $user = $auth->requireAdmin($token);
        $form_id = $matches[1];
        
        if ($method === 'PUT') {
            $input = getJsonInput();
            $stmt = $db->prepare("UPDATE application_forms SET title = ?, description = ?, position = ?, fields = ?, webhook_url = ? WHERE id = ?");
            $stmt->execute([
                $input['title'],
                $input['description'],
                $input['position'],
                json_encode($input['fields']),
                $input['webhook_url'] ?? '',
                $form_id
            ]);
            
            sendResponse(['message' => 'Form updated successfully']);
        } elseif ($method === 'DELETE') {
            $stmt = $db->prepare("DELETE FROM application_forms WHERE id = ?");
            $stmt->execute([$form_id]);
            
            sendResponse(['message' => 'Form deleted successfully']);
        }
    }
    
    // Admin Submissions Management
    elseif ($path === '/admin/submissions' && $method === 'GET') {
        $token = getAuthToken();
        $user = $auth->requireStaffOrAdmin($token);
        
        if ($user['role'] === 'admin') {
            $stmt = $db->prepare("SELECT * FROM application_submissions ORDER BY submitted_at DESC");
            $stmt->execute();
        } else {
            $allowed_forms = json_decode($user['allowed_forms'], true) ?: [];
            if (empty($allowed_forms)) {
                sendResponse([]);
            }
            
            $placeholders = str_repeat('?,', count($allowed_forms) - 1) . '?';
            $stmt = $db->prepare("SELECT * FROM application_submissions WHERE form_id IN ($placeholders) ORDER BY submitted_at DESC");
            $stmt->execute($allowed_forms);
        }
        
        $submissions = $stmt->fetchAll();
        foreach ($submissions as &$submission) {
            $submission['responses'] = json_decode($submission['responses'], true);
        }
        
        sendResponse($submissions);
    }
    
    // Get/Update specific submission
    elseif (preg_match('/^\/admin\/submissions\/([^\/]+)$/', $path, $matches)) {
        $token = getAuthToken();
        $user = $auth->requireStaffOrAdmin($token);
        $submission_id = $matches[1];
        
        if ($method === 'GET') {
            $stmt = $db->prepare("SELECT * FROM application_submissions WHERE id = ?");
            $stmt->execute([$submission_id]);
            $submission = $stmt->fetch();
            
            if (!$submission) {
                sendResponse(['error' => 'Submission not found'], 404);
            }
            
            // Check form access for staff
            if ($user['role'] === 'staff') {
                $allowed_forms = json_decode($user['allowed_forms'], true) ?: [];
                if (!in_array($submission['form_id'], $allowed_forms)) {
                    sendResponse(['error' => 'Access denied'], 403);
                }
            }
            
            $submission['responses'] = json_decode($submission['responses'], true);
            sendResponse($submission);
        }
    }
    
    // Update submission status
    elseif (preg_match('/^\/admin\/submissions\/([^\/]+)\/status$/', $path, $matches) && $method === 'PUT') {
        $token = getAuthToken();
        $user = $auth->requireStaffOrAdmin($token);
        $submission_id = $matches[1];
        $input = getJsonInput();
        
        // Get submission to check form access
        $stmt = $db->prepare("SELECT form_id FROM application_submissions WHERE id = ?");
        $stmt->execute([$submission_id]);
        $submission = $stmt->fetch();
        
        if (!$submission) {
            sendResponse(['error' => 'Submission not found'], 404);
        }
        
        // Check form access for staff
        if ($user['role'] === 'staff') {
            $allowed_forms = json_decode($user['allowed_forms'], true) ?: [];
            if (!in_array($submission['form_id'], $allowed_forms)) {
                sendResponse(['error' => 'Access denied'], 403);
            }
        }
        
        $stmt = $db->prepare("UPDATE application_submissions SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $submission_id]);
        
        sendResponse(['message' => 'Status updated successfully']);
    }
    
    // User Management
    elseif ($path === '/admin/users' && $method === 'GET') {
        $token = getAuthToken();
        $auth->requireAdmin($token);
        
        $stmt = $db->prepare("SELECT id, username, role, allowed_forms, created_at, created_by FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        foreach ($users as &$user) {
            $user['allowed_forms'] = json_decode($user['allowed_forms'], true) ?: [];
        }
        
        sendResponse($users);
    }
    
    elseif ($path === '/admin/create-user' && $method === 'POST') {
        $token = getAuthToken();
        $admin = $auth->requireAdmin($token);
        $input = getJsonInput();
        
        // Check if username exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$input['username']]);
        if ($stmt->fetch()) {
            sendResponse(['error' => 'Username already exists'], 400);
        }
        
        $user_id = Database::generateUUID('user-');
        $stmt = $db->prepare("INSERT INTO users (id, username, password_hash, role, allowed_forms, created_by) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $input['username'],
            $auth->hashPassword($input['password']),
            $input['role'],
            json_encode($input['allowed_forms'] ?? []),
            $admin['username']
        ]);
        
        sendResponse(['message' => 'User created successfully']);
    }
    
    // Update/Delete user
    elseif (preg_match('/^\/admin\/users\/([^\/]+)$/', $path, $matches)) {
        $token = getAuthToken();
        $admin = $auth->requireAdmin($token);
        $user_id = $matches[1];
        
        if ($method === 'PUT') {
            $input = getJsonInput();
            
            // Don't allow updating yourself
            if ($user_id === $admin['id']) {
                sendResponse(['error' => 'Cannot update your own account'], 400);
            }
            
            $updates = [];
            $params = [];
            
            if (isset($input['username'])) {
                $updates[] = "username = ?";
                $params[] = $input['username'];
            }
            if (isset($input['password'])) {
                $updates[] = "password_hash = ?";
                $params[] = $auth->hashPassword($input['password']);
            }
            if (isset($input['allowed_forms'])) {
                $updates[] = "allowed_forms = ?";
                $params[] = json_encode($input['allowed_forms']);
            }
            
            if (!empty($updates)) {
                $params[] = $user_id;
                $stmt = $db->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?");
                $stmt->execute($params);
            }
            
            sendResponse(['message' => 'User updated successfully']);
        } elseif ($method === 'DELETE') {
            // Don't allow deleting yourself or default admin
            if ($user_id === $admin['id']) {
                sendResponse(['error' => 'Cannot delete your own account'], 400);
            }
            
            $stmt = $db->prepare("SELECT username FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if ($user && $user['username'] === 'admin') {
                sendResponse(['error' => 'Cannot delete default admin account'], 400);
            }
            
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            
            sendResponse(['message' => 'User deleted successfully']);
        }
    }
    
    // Changelogs
    elseif ($path === '/changelogs' && $method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM changelogs ORDER BY created_at DESC LIMIT 10");
        $stmt->execute();
        sendResponse($stmt->fetchAll());
    }
    
    elseif ($path === '/admin/changelogs' && $method === 'GET') {
        $token = getAuthToken();
        $auth->requireAdmin($token);
        
        $stmt = $db->prepare("SELECT * FROM changelogs ORDER BY created_at DESC");
        $stmt->execute();
        sendResponse($stmt->fetchAll());
    }
    
    elseif ($path === '/admin/changelogs' && $method === 'POST') {
        $token = getAuthToken();
        $user = $auth->requireAdmin($token);
        $input = getJsonInput();
        
        $changelog_id = Database::generateUUID('changelog-');
        $stmt = $db->prepare("INSERT INTO changelogs (id, title, content, version, created_by) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $changelog_id,
            $input['title'],
            $input['content'],
            $input['version'] ?? null,
            $user['username']
        ]);
        
        sendResponse(['message' => 'Changelog created successfully', 'id' => $changelog_id]);
    }
    
    // Update/Delete changelog
    elseif (preg_match('/^\/admin\/changelogs\/([^\/]+)$/', $path, $matches)) {
        $token = getAuthToken();
        $auth->requireAdmin($token);
        $changelog_id = $matches[1];
        
        if ($method === 'PUT') {
            $input = getJsonInput();
            $stmt = $db->prepare("UPDATE changelogs SET title = ?, content = ?, version = ? WHERE id = ?");
            $stmt->execute([
                $input['title'],
                $input['content'],
                $input['version'] ?? null,
                $changelog_id
            ]);
            
            sendResponse(['message' => 'Changelog updated successfully']);
        } elseif ($method === 'DELETE') {
            $stmt = $db->prepare("DELETE FROM changelogs WHERE id = ?");
            $stmt->execute([$changelog_id]);
            
            sendResponse(['message' => 'Changelog deleted successfully']);
        }
    }
    
    else {
        sendResponse(['error' => 'Endpoint not found'], 404);
    }

} catch (Exception $e) {
    if (DEBUG_MODE) {
        sendResponse(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    } else {
        sendResponse(['error' => 'Internal server error'], 500);
    }
}
?>