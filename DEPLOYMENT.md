# Revolution Roleplay - Simply Hosting Deployment

## Deployment Guide

Denne applikation er nu konfigureret til deployment på Simply som en statisk React applikation.

### Funktioner
- ✅ Fuldt statisk React applikation 
- ✅ Al data gemt i JavaScript filer og localStorage
- ✅ Ingen backend afhængigheder
- ✅ FiveM server integration (direkte API kald)
- ✅ Admin panel med fuld funktionalitet
- ✅ Role-baseret adgangskontrol
- ✅ Application management system
- ✅ Changelog system

### Deployment på Simply

1. **Build applikationen:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload til Simply:**
   - Log ind på dit Simply kontrolpanel
   - Gå til File Manager eller brug FTP
   - Upload hele indholdet fra `build/` mappen til din website rod (public_html)
   - Sørg for at `.htaccess` filen også uploades

3. **FTP Upload (alternativ):**
   ```bash
   # Brug din FTP klient til at uploade build/ indhold til:
   # Host: ftp.simply.com (eller dit subdomain)
   # Port: 21
   # Upload til: /public_html/
   ```

### Standard Login
- **Brugernavn:** admin
- **Adgangskode:** admin123

### Data Storage
Al data gemmes lokalt i:
- `src/data/users.js` - Brugerdata
- `src/data/applications.js` - Ansøgningsformularer
- `src/data/submissions.js` - Indsendte ansøgninger  
- `src/data/changelogs.js` - Changelog data
- localStorage - Persistens mellem sessioner

### Konfiguration
Applikationen henter automatisk live data fra:
- **FiveM Server:** `http://45.84.198.57:30120/dynamic.json`
- **Discord Server:** Link til `https://discord.gg/htQNqeuxUY`

### Udvikling
```bash
cd frontend
npm install
npm start
```

### Vigtige Noter
- `.htaccess` filen håndterer SPA routing på Apache servere
- Alle React routes vil fungere korrekt
- Applikationen er optimeret til danske hosting udbydere
- Sikkerhedsheaders er inkluderet i .htaccess

### Support
Hvis du har problemer med deployment, kontakt Simply support og reference at det er en React Single Page Application (SPA).