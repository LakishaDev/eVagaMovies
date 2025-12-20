#!/bin/bash

# eVagaMovies - Simple Startup Script (No GUI terminals needed)

echo "🎬 eVagaMovies - Starting servers..."
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Install with NVM first."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start Backend in background
echo "🔧 Starting Backend..."
cd "$SCRIPT_DIR/backend" || exit
npm install --silent > /dev/null 2>&1
npm run dev > /tmp/evaga-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: /tmp/evaga-backend.log"

# Wait for backend
sleep 3

# Start Frontend in background
echo ""
echo "🎨 Starting Frontend..."
cd "$SCRIPT_DIR/frontend" || exit
npm install --silent > /dev/null 2>&1
npm run dev > /tmp/evaga-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo "   Logs: /tmp/evaga-frontend.log"

# Wait for frontend to start
sleep 5

echo ""
echo "════════════════════════════════════════════════"
echo "✅ eVagaMovies is running!"
echo ""
echo "📡 Backend API:  http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f /tmp/evaga-backend.log"
echo "   Frontend: tail -f /tmp/evaga-frontend.log"
echo ""
echo "⏹️  Stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "   Or run: ./stop.sh"
echo "════════════════════════════════════════════════"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > /tmp/evaga-backend.pid
echo "$FRONTEND_PID" > /tmp/evaga-frontend.pid

# Open browser after 2 seconds (optional)
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &> /dev/null &
fi

echo "Press Ctrl+C to view this message again, or run ./stop.sh to stop servers"
echo ""

# Keep script alive
tail -f /dev/null
