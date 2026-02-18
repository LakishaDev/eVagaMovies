#!/bin/bash

# eVagaMovies Stop Script
echo "🛑 Stopping eVagaMovies services..."

sudo pm2 stop all
sudo pm2 delete all

echo "✅ All services stopped!"
