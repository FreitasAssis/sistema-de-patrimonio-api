#!/bin/bash

echo "🧪 Testing Production Build Locally"
echo "======================================"
echo ""

# Step 1: Clean old build
echo "🧹 Cleaning old build..."
rm -rf dist
echo "✅ Cleaned"
echo ""

# Step 2: Build
echo "🔨 Building TypeScript..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 3: Check output
echo "📁 Checking compiled files..."
if [ -f "dist/server.js" ]; then
    echo "✅ dist/server.js exists"
else
    echo "❌ dist/server.js NOT found!"
    exit 1
fi

if [ -d "dist/models" ]; then
    echo "✅ dist/models directory exists"
    ls -1 dist/models | head -5
else
    echo "❌ dist/models directory NOT found!"
    exit 1
fi

if [ -d "dist/config" ]; then
    echo "✅ dist/config directory exists"
else
    echo "❌ dist/config directory NOT found!"
    exit 1
fi
echo ""

# Step 4: Test run (with timeout)
echo "🚀 Testing server startup..."
echo "   (Will timeout after 10 seconds if successful)"
echo ""

timeout 10s node dist/server.js

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 124 ]; then
    echo "✅ Server started successfully (timeout = good!)"
    echo "✅ Production build is ready for deployment"
    exit 0
elif [ $EXIT_CODE -eq 0 ]; then
    echo "⚠️  Server exited cleanly (might be okay)"
    exit 0
else
    echo "❌ Server failed to start (exit code: $EXIT_CODE)"
    echo "❌ Fix errors before deploying to Render"
    exit 1
fi
