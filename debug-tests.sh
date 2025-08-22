#!/bin/bash

# Debug script for CI/CD test discovery issues
echo "🔍 Jest Test Discovery Debug Script"
echo "==================================="

echo "📂 Current working directory:"
pwd

echo ""
echo "📋 Directory structure:"
find . -name "*.test.js" -o -name "*.spec.js" | head -20

echo ""
echo "🗂️ Backend directory contents:"
ls -la backend/

echo ""
echo "📁 Backend src directory:"
ls -la backend/src/

echo ""
echo "🧪 Backend tests directory:"
if [ -d "backend/src/tests" ]; then
    ls -la backend/src/tests/
    echo ""
    echo "📄 Test files found:"
    find backend/src/tests -name "*.test.js" -o -name "*.spec.js"
else
    echo "❌ Tests directory not found!"
fi

echo ""
echo "⚙️ Jest configuration:"
if [ -f "backend/jest.config.json" ]; then
    echo "✅ Jest config found"
    cat backend/jest.config.json
else
    echo "❌ Jest config not found!"
fi

echo ""
echo "📦 Package.json test script:"
if [ -f "backend/package.json" ]; then
    echo "✅ Package.json found"
    grep -A 5 -B 5 '"test"' backend/package.json
else
    echo "❌ Package.json not found!"
fi

echo ""
echo "🔧 Jest version:"
cd backend
npm list jest

echo ""
echo "🎯 Jest dry run (showing what files it would test):"
npx jest --listTests || echo "❌ Jest listTests failed"
