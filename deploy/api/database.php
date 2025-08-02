<?php
// Revolution Roleplay - Database Connection Class

require_once 'config.php';

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    private $conn = null;
    
    public function getConnection() {
        if ($this->conn === null) {
            try {
                $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            } catch(PDOException $e) {
                if (DEBUG_MODE) {
                    echo "Connection Error: " . $e->getMessage();
                } else {
                    echo "Database connection failed";
                }
                exit();
            }
        }
        
        return $this->conn;
    }
    
    public function closeConnection() {
        $this->conn = null;
    }
    
    // Helper method to generate UUID
    public static function generateUUID($prefix = '') {
        return $prefix . uniqid() . '_' . time();
    }
    
    // Helper method to sanitize input
    public static function sanitize($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    
    // Helper method to validate JSON
    public static function isValidJSON($string) {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}

// Global database instance
$database = new Database();
$db = $database->getConnection();
?>