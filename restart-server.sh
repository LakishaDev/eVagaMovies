#!/bin/bash

# Quick Restart Script - koristi ovaj script da restartuje server nakon izmena

echo "🔄 Restarting eVagaMovies server..."
echo ""

# Zaustavi postojeći server
pkill -f "node.*server.js" 2>/dev/null && echo "✅ Stopped old server" || echo "ℹ️  No server running"

# Čekaj malo
sleep 1

# Pokreni novi server
cd backend
echo "🚀 Starting server..."
nohup npm start > ../server.log 2>&1 &

sleep 2

# Proveri status
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Server started successfully!"
    echo ""
    echo "📊 Server info:"
    echo "   URL: http://localhost:3001"
    echo "   Logs: tail -f server.log"
    echo ""
else
    echo "❌ Failed to start server"
    echo "Check logs: cat server.log"
    exit 1
fi
