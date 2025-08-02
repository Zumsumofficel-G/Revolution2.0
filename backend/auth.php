<?php
// Revolution Roleplay - Authentication Helper

require_once 'database.php';

class Auth {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    // Hash password
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    // Verify password
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // Generate simple token (for demo - use proper JWT in production)
    public function generateToken($user_data) {
        $payload = [
            'user_id' => $user_data['id'],
            'username' => $user_data['username'],
            'role' => $user_data['role'],
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ];
        
        return base64_encode(json_encode($payload));
    }
    
    // Verify token
    public function verifyToken($token) {
        try {
            $payload = json_decode(base64_decode($token), true);
            
            if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
                return false;
            }
            
            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }
    
    // Get current user from token
    public function getCurrentUser($token) {
        $payload = $this->verifyToken($token);
        if (!$payload) {
            return false;
        }
        
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        return $stmt->fetch();
    }
    
    // Check if user has admin access
    public function requireAdmin($token) {
        $user = $this->getCurrentUser($token);
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        return $user;
    }
    
    // Check if user has staff or admin access
    public function requireStaffOrAdmin($token) {
        $user = $this->getCurrentUser($token);
        if (!$user || !in_array($user['role'], ['admin', 'staff'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Staff or admin access required']);
            exit();
        }
        return $user;
    }
    
    // Check if user has access to specific form
    public function checkFormAccess($token, $form_id) {
        $user = $this->getCurrentUser($token);
        if (!$user) {
            return false;
        }
        
        // Admin has access to all forms
        if ($user['role'] === 'admin') {
            return $user;
        }
        
        // Staff needs specific form access
        if ($user['role'] === 'staff') {
            $allowed_forms = json_decode($user['allowed_forms'], true) ?: [];
            if (in_array($form_id, $allowed_forms)) {
                return $user;
            }
        }
        
        return false;
    }
    
    // Login user
    public function login($username, $password) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && $this->verifyPassword($password, $user['password_hash'])) {
            return [
                'success' => true,
                'token' => $this->generateToken($user),
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'allowed_forms' => json_decode($user['allowed_forms'], true) ?: []
                ]
            ];
        }
        
        return ['success' => false, 'error' => 'Invalid credentials'];
    }
}

// Global auth instance
$auth = new Auth($db);
?>