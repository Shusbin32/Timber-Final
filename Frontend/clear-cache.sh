#!/bin/bash

echo "🧹 Clearing cache and restarting development server..."

# Stop any running Next.js processes
echo "Stopping any running processes..."
pkill -f "next dev" || true
pkill -f "next start" || true

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules (optional - uncomment if needed)
# echo "Clearing node_modules..."
# rm -rf node_modules
# npm install

# Clear browser cache instructions
echo ""
echo "🌐 Browser Cache Instructions:"
echo "1. Open Developer Tools (F12)"
echo "2. Right-click the refresh button"
echo "3. Select 'Empty Cache and Hard Reload'"
echo "4. Or press Ctrl+Shift+R (Cmd+Shift+R on Mac)"
echo ""

# Restart development server
echo "🚀 Starting development server..."
npm run dev 