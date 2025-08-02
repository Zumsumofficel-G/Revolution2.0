<?php
// Revolution Roleplay - Database Configuration

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'revolution_rp');
define('DB_USER', 'your_username');  // Opdater med dit MySQL brugernavn
define('DB_PASS', 'your_password');  // Opdater med dit MySQL password
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
define('JWT_SECRET', 'revolution_roleplay_secret_key_2025');
define('JWT_ALGORITHM', 'HS256');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'https://yourdomain.com',  // Opdater med dit domæne
    'https://www.yourdomain.com'
]);

// FiveM Server Configuration
define('FIVEM_SERVER_URL', 'http://45.84.198.57:30120/dynamic.json');

// Discord Configuration
define('DISCORD_INVITE_URL', 'https://discord.gg/htQNqeuxUY');

// Error Reporting (Set to false in production)
define('DEBUG_MODE', true);

// Timezone
date_default_timezone_set('Europe/Copenhagen');

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.use_strict_mode', 1);

// Error Handling
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
?>