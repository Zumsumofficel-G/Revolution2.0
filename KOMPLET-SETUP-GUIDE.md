# 🎮 Revolution Roleplay - Komplet Setup Guide

## 📋 Oversigt
Denne guide viser dig præcis hvordan du sætter Revolution Roleplay op på Simply hosting med MySQL database.

---

## 🛠️ **STEP 1: Forbered Filerne**

### 1.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```
✅ Dette opretter `build/` mappen med alle website filer.

### 1.2 Tjek at du har disse filer:
```
📁 frontend/build/
├── index.html
├── .htaccess
└── static/ (mappe med CSS/JS)

📁 backend/
├── api.php
├── config.php  
├── database.php
├── auth.php
├── database.sql
└── .htaccess
```

---

## 🗄️ **STEP 2: Opret MySQL Database**

### 2.1 Log ind på Simply
1. Gå til **Simply.com** og log ind
2. Vælg dit domæne/hosting pakke
3. Klik på **"Kontrolpanel"**

### 2.2 Opret Database
1. Find **"MySQL Databases"** i kontrolpanelet
2. Klik **"Opret ny database"**
3. Database navn: `revolution_rp` 
4. Klik **"Opret"**

### 2.3 Opret Database Bruger
1. I MySQL sektionen, klik **"Tilføj bruger"**
2. Brugernavn: `revolution_user` (eller vælg selv)
3. Adgangskode: **Opret en stærk adgangskode**
4. Tildel brugeren **ALLE rettigheder** til `revolution_rp` databasen
5. Klik **"Gem"**

### 2.4 Importer Database Schema
1. Find **"phpMyAdmin"** i kontrolpanelet
2. Klik på din `revolution_rp` database
3. Klik på **"Import"** tabben
4. Vælg filen: `backend/database.sql`
5. Klik **"Go"**

✅ **Resultat:** Du skulle nu se 4 tabeller: `users`, `application_forms`, `application_submissions`, `changelogs`

---

## ⚙️ **STEP 3: Konfigurer Backend**

### 3.1 Rediger config.php
Åbn `backend/config.php` og opdater disse linjer:

```php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'revolution_rp');           // Dit database navn
define('DB_USER', 'revolution_user');         // Dit database brugernavn  
define('DB_PASS', 'din_adgangskode_her');     // Din database adgangskode

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'https://ditdomaene.dk',              // Skift til dit rigtige domæne
    'https://www.ditdomaene.dk'           // Skift til dit rigtige domæne
]);
```

### 3.2 Test Database Forbindelse (Valgfrit)
Opret en test fil `backend/test.php`:
```php
<?php
require_once 'config.php';
require_once 'database.php';

echo "Testing database connection...\n";
try {
    $db = $database->getConnection();
    echo "✅ Database forbindelse vellykket!\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Fundet {$result['count']} brugere i databasen\n";
} catch (Exception $e) {
    echo "❌ Database fejl: " . $e->getMessage() . "\n";
}
?>
```

---

## 📤 **STEP 4: Upload Filer til Simply**

### 4.1 Upload Frontend
1. Gå til **"File Manager"** i Simply kontrolpanel
2. Naviger til `public_html/` mappen
3. **Slet** alle eksisterende filer i `public_html/` (backup først hvis nødvendigt)
4. Upload **ALT** fra `frontend/build/` til `public_html/`

**Resultat:**
```
public_html/
├── index.html
├── .htaccess
└── static/
    ├── css/
    └── js/
```

### 4.2 Upload Backend API
1. I `public_html/`, opret ny mappe kaldet `api`
2. Upload **ALT** fra `backend/` til `public_html/api/`

**Resultat:**
```
public_html/
├── index.html
├── .htaccess
├── static/
└── api/
    ├── api.php
    ├── config.php
    ├── database.php
    ├── auth.php
    ├── database.sql
    └── .htaccess
```

---

## 🧪 **STEP 5: Test Setup**

### 5.1 Test Website
1. Gå til dit domæne: `https://ditdomaene.dk`
2. Du skulle se Revolution Roleplay forsiden
3. Tjek at server stats vises (FiveM integration)
4. Klik på ansøgningsformularer for at teste

### 5.2 Test Admin Panel
1. Klik **"Admin Panel"** øverst til højre
2. Log ind med:
   - **Brugernavn:** `admin`
   - **Adgangskode:** `admin123`
3. Du skulle nu se admin dashboardet med alle tabs

### 5.3 Test API Direkte
Gå til: `https://ditdomaene.dk/api/server-stats`
Du skulle se JSON data som dette:
```json
{
  "players": 1,
  "max_players": 64,
  "hostname": "Revolution Roleplay",
  "gametype": "ESX Legacy"
}
```

---

## 🔧 **STEP 6: Fejlfinding**

### Problem: "Database connection failed"
**Løsning:**
1. Tjek at database credentials i `config.php` er korrekte
2. Kontrollér at database brugeren har alle rettigheder
3. Tjek at `revolution_rp` databasen eksisterer

### Problem: "API endpoint not found"
**Løsning:**
1. Tjek at `.htaccess` filen er i `public_html/api/` mappen
2. Kontrollér at mod_rewrite er aktiveret (kontakt Simply support)
3. Tjek at alle backend filer er uploadet korrekt

### Problem: "CORS error"
**Løsning:**
1. Opdater domænet i `config.php` under `ALLOWED_ORIGINS`
2. Tjek at `.htaccess` CORS headers er korrekte

### Problem: Frontend loader ikke
**Løsning:**
1. Tjek at `index.html` er i rod af `public_html/`
2. Kontrollér at `.htaccess` er uploadet (for SPA routing)
3. Tjek browser console for fejl

---

## 🎯 **STEP 7: Finalisering**

### 7.1 Sikkerhed
1. **Skift admin password:**
   - Log ind som admin
   - Gå til "Brugerstyring" 
   - Rediger admin brugeren
   - Sæt ny stærk adgangskode

2. **Fjern test filer:**
   - Slet `backend/test.php` hvis du oprettede den

### 7.2 Konfigurer FiveM Server
1. I admin panelet, gå til ansøgninger
2. Opret dine egne ansøgningsformularer
3. Sæt Discord webhook URLs for notifikationer

### 7.3 Tilpas Indhold
1. Rediger changelogs i admin panelet
2. Tilføj dine egne nyheder og opdateringer
3. Opret staff brugere med begrænsede rettigheder

---

## ✅ **Resultat**

Du har nu et fuldt fungerende Revolution Roleplay website med:

🎮 **Frontend Features:**
- Moderne landing page med FiveM server stats
- Ansøgningssystem
- Discord integration
- Responsivt design

🔧 **Admin Panel:**
- Bruger management (admin/staff roller)
- Ansøgningsformular editor
- Submission tracking
- Changelog system

🗄️ **Database:**
- MySQL database med alle data
- Sikker authentication
- Role-based access control

---

## 📞 **Support**

Hvis du har problemer:
1. Tjek først fejlfinding sektionen ovenfor
2. Kontakt Simply support for server-specifikke problemer
3. Tjek at PHP version er 7.4+ (standard på Simply)

**🎉 Din Revolution Roleplay website er nu live!**

**Standard login:** admin / admin123 (husk at skifte password!)