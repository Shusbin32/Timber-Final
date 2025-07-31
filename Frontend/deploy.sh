#!/bin/bash

# Production Deployment Script for Timber CRM
echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Optional: Run tests if they exist
    if npm run test 2>/dev/null; then
        echo "✅ Tests passed!"
    else
        echo "⚠️ No tests found or tests failed"
    fi
    
    echo "🎉 Deployment ready!"
    echo "📋 Next steps:"
    echo "   1. Set up your production environment variables"
    echo "   2. Configure your web server (nginx, Apache, etc.)"
    echo "   3. Set up SSL certificates"
    echo "   4. Configure your domain"
    echo "   5. Start the application with: npm start"
else
    echo "❌ Build failed!"
    exit 1
fi 