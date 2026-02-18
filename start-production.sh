#!/bin/bash

# eVagaMovies Production Start Script
echo "🎬 Starting eVagaMovies Production Setup..."

# Navigate to project root
cd /home/lakisha/eVagaMovies

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build complete!"

# Go back to root
cd /home/lakisha/eVagaMovies

# Stop existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
sudo pm2 stop ecosystem.config.cjs 2>/dev/null || true
sudo pm2 delete all 2>/dev/null || true

# Start with PM2 (sudo required for port 80)
echo "🚀 Starting services with PM2..."
sudo pm2 start ecosystem.config.cjs

# Save PM2 configuration
sudo pm2 save

# Setup PM2 startup script (if not already done)
echo "🔧 Configuring PM2 startup..."
sudo env PATH=$PATH:/home/lakisha/.nvm/versions/node/v24.12.0/bin pm2 startup systemd -u root --hp /root

echo "✅ eVagaMovies is running!"
echo "📺 Frontend: http://10.0.0.3 (or http://filmovi.local)"
echo "🎞️  Backend: http://10.0.0.3:3001"
echo "🔧 Pihole Admin: http://10.0.0.3:8080/admin"
echo ""
echo "PM2 Commands:"
echo "  pm2 list          - View running processes"
echo "  pm2 logs          - View logs"
echo "  pm2 restart all   - Restart all services"
echo "  pm2 stop all      - Stop all services"
