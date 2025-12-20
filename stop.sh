#!/bin/bash

# Stop eVagaMovies servers

echo "⏹️  Stopping eVagaMovies..."

if [ -f /tmp/evaga-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/evaga-backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    else
        echo "⚠️  Backend already stopped"
    fi
    rm /tmp/evaga-backend.pid
else
    echo "⚠️  Backend PID file not found"
fi

if [ -f /tmp/evaga-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/evaga-frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo "⚠️  Frontend already stopped"
    fi
    rm /tmp/evaga-frontend.pid
else
    echo "⚠️  Frontend PID file not found"
fi

# Also kill any orphaned node processes
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

echo ""
echo "✅ All servers stopped!"
