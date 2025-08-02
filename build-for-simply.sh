# Simply Hosting - Build Script

echo "🚀 Building Revolution Roleplay for Simply hosting..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create deployment package
echo "📋 Creating deployment instructions..."

echo ""
echo "✅ BUILD COMPLETED!"
echo ""
echo "📁 Upload the contents of the 'build/' folder to your Simply hosting:"
echo "   - Login to Simply control panel"
echo "   - Go to File Manager"
echo "   - Upload ALL files from frontend/build/ to public_html/"
echo "   - Make sure .htaccess is included"
echo ""
echo "🔐 Admin Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🌐 Your website will be available at your Simply domain"
echo ""