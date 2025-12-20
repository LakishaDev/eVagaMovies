#!/bin/bash

# eVagaMovies Startup Script

echo "🎬 Starting eVagaMovies..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Start Backend
echo ""
echo "🔧 Starting Backend Server..."
cd backend || exit
npm install --silent
gnome-terminal -- bash -c "npm run dev; exec bash" &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend  
echo ""
echo "🎨 Starting Frontend Server..."
cd ../frontend || exit
npm install --silent
gnome-terminal -- bash -c "npm run dev; exec bash" &
FRONTEND_PID=$!

echo ""
echo "✅ eVagaMovies started successfully!"
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running
wait
