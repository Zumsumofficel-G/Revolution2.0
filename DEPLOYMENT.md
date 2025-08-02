# Revolution Roleplay - Vercel Deployment

## Deployment Guide

Denne applikation er nu konfigureret til deployment på Vercel som en statisk React applikation.

### Funktioner
- ✅ Fuldt statisk React applikation 
- ✅ Al data gemt i JavaScript filer og localStorage
- ✅ Ingen backend afhængigheder
- ✅ FiveM server integration (direkte API kald)
- ✅ Admin panel med fuld funktionalitet
- ✅ Role-baseret adgangskontrol
- ✅ Application management system
- ✅ Changelog system

### Deployment på Vercel

1. **Push til GitHub:**
   ```bash
   git add .
   git commit -m "Klar til Vercel deployment"
   git push origin main
   ```

2. **Connect til Vercel:**
   - Gå til [vercel.com](https://vercel.com)
   - Import dit GitHub repository
   - Vælg `frontend` som root directory
   - Deploy automatisk

3. **Alternativ - Vercel CLI:**
   ```bash
   npm i -g vercel
   cd frontend
   vercel --prod
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

Applikation kører på http://localhost:3000