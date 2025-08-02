# Revolution Roleplay - Simply Hosting + MySQL Setup

## Complete Guide til Simply Hosting med MySQL Database

### 📋 **Hvad du skal uploade:**

**1. Frontend Build:**
- Upload indholdet fra `frontend/build/` til `public_html/`

**2. Backend API:**
- Upload alt fra `backend/` til `public_html/api/` 

**3. Database:**
- Importer `backend/database.sql` til din MySQL database

### 🚀 **Simply Hosting Setup:**

#### **Step 1: Database Setup**
1. Log ind på Simply kontrolpanel
2. Gå til "MySQL Databases" 
3. Opret ny database: `revolution_rp`
4. Opret database bruger og tildel rettigheder
5. Importer `backend/database.sql` via phpMyAdmin

#### **Step 2: Backend Konfiguration**
1. Rediger `backend/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_db_name');     // Dit database navn
   define('DB_USER', 'your_db_user');     // Dit database brugernavn  
   define('DB_PASS', 'your_db_password'); // Dit database password
   ```

#### **Step 3: Upload Filer**
```
public_html/
├── index.html              (Fra frontend/build/)
├── static/                 (Fra frontend/build/)
├── .htaccess              (Fra frontend/build/)
└── api/
    ├── api.php
    ├── config.php
    ├── database.php
    ├── auth.php
    └── .htaccess
```

#### **Step 4: API .htaccess**
Opret `/public_html/api/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ api.php [QSA,L]

# Security headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type,Authorization"
```

### 🔧 **Features:**

**✅ Fuldt funktionelle:**
- MySQL database med tabeller og sample data
- PHP API med alle endpoints
- Authentication med JWT tokens
- Role-based access control (admin/staff)
- Application form management
- Submission handling
- User management
- Changelog system
- FiveM server integration

### 🔐 **Standard Login:**
- **Brugernavn:** admin
- **Adgangskode:** admin123

### 📊 **Database Struktur:**
- `users` - Admin og staff brugere
- `application_forms` - Ansøgningsformularer
- `application_submissions` - Indsendte ansøgninger
- `changelogs` - Server opdateringer

### 🌐 **API Endpoints:**
```
GET  /api/server-stats
GET  /api/applications
POST /api/applications/submit
POST /api/admin/login
GET  /api/user/me
GET  /api/admin/application-forms
POST /api/admin/application-forms
GET  /api/admin/submissions
GET  /api/changelogs
POST /api/admin/changelogs
GET  /api/admin/users
POST /api/admin/create-user
```

### 🛠 **Troubleshooting:**
- Hvis API ikke virker, tjek database forbindelse i `config.php`
- Sikrer dig at mod_rewrite er aktiveret på serveren
- Tjek PHP version (kræver PHP 7.4+)
- Verificer MySQL bruger har alle nødvendige rettigheder

### 📱 **Test Setup:**
1. Gå til dit domæne
2. Verificer landing page loader
3. Test admin login
4. Tjek at alle admin funktioner virker
5. Test application submission

**Simply hosting understøtter MySQL og PHP, så alt skulle virke perfekt! 🎯**