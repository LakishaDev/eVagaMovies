#!/bin/bash

# Setup filmovi.local domain
echo "🌐 Setting up filmovi.local domain..."

# Backup hosts file
sudo cp /etc/hosts /etc/hosts.backup

# Check if entry already exists
if grep -q "filmovi.local" /etc/hosts; then
    echo "⚠️  filmovi.local already exists in /etc/hosts"
else
    # Add entry
    echo "10.0.0.3    filmovi.local" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ Added filmovi.local to /etc/hosts"
fi

echo ""
echo "✅ Setup complete!"
echo "🎬 You can now access eVagaMovies at:"
echo "   - http://filmovi.local"
echo "   - http://10.0.0.3"
