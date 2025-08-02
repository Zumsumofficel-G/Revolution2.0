#!/bin/bash

# Revolution Roleplay - Quick Deploy Script for Simply

echo "🎮 Revolution Roleplay - Deploy til Simply"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Fejl: Kør dette script fra rod af projektet"
    exit 1
fi

echo ""
echo "📦 Step 1: Building frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build fejlede"
    exit 1
fi

cd ..

echo "✅ Frontend build komplet"
echo ""

echo "📁 Step 2: Opretter deployment mappe..."
rm -rf deploy
mkdir -p deploy/website
mkdir -p deploy/api

echo ""
echo "📋 Step 3: Kopierer filer..."

# Copy frontend build to website
cp -r frontend/build/* deploy/website/
echo "✅ Frontend filer kopieret til deploy/website/"

# Copy backend to api
cp backend/*.php deploy/api/
cp backend/.htaccess deploy/api/
cp backend/database.sql deploy/api/
echo "✅ Backend filer kopieret til deploy/api/"

echo ""
echo "🎯 Deploy forberedt! Upload følgende til Simply:"
echo ""
echo "📁 deploy/website/ → Upload til public_html/"
echo "📁 deploy/api/     → Upload til public_html/api/"
echo ""
echo "🔧 Husk at:"
echo "1. Opret MySQL database og importer deploy/api/database.sql"
echo "2. Rediger deploy/api/config.php med dine database oplysninger"
echo "3. Test at alt virker på dit domæne"
echo ""
echo "🔐 Standard login: admin / admin123"
echo ""
echo "✅ Klar til deployment!"