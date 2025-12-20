#!/bin/bash

# FFmpeg Auto-Installer Script
# Automatski instalira FFmpeg na osnovu detektovanog OS-a

echo "🎬 FFmpeg Auto-Installer Agent"
echo "================================"
echo ""

# Provera da li je FFmpeg već instaliran
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg je već instaliran!"
    ffmpeg -version | head -n 1
    echo ""
    echo "🎉 Thumbnail generisanje je omogućeno!"
    exit 0
fi

echo "⚠️  FFmpeg nije pronađen."
echo ""

# Detekcija OS-a
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS=$(uname -s)
fi

echo "🔧 Detektovan OS: $OS"
echo "📦 Instaliranje FFmpeg-a..."
echo ""

# Instalacija na osnovu OS-a
case $OS in
    fedora)
        echo "Izvršavam: sudo dnf install -y ffmpeg"
        sudo dnf install -y ffmpeg
        ;;
    
    ubuntu|debian)
        echo "Izvršavam: sudo apt update && sudo apt install -y ffmpeg"
        sudo apt update
        sudo apt install -y ffmpeg
        ;;
    
    arch)
        echo "Izvršavam: sudo pacman -S --noconfirm ffmpeg"
        sudo pacman -S --noconfirm ffmpeg
        ;;
    
    rhel|centos)
        echo "Izvršavam: sudo yum install -y ffmpeg"
        sudo yum install -y ffmpeg
        ;;
    
    Darwin)
        echo "❌ macOS detektovan. Molimo instalirajte Homebrew pa pokrenite:"
        echo "   brew install ffmpeg"
        exit 1
        ;;
    
    *)
        echo "❌ Nepoznat operativni sistem: $OS"
        echo "Molimo instalirajte FFmpeg ručno:"
        echo "  Fedora:        sudo dnf install ffmpeg"
        echo "  Ubuntu/Debian: sudo apt install ffmpeg"
        echo "  Arch:          sudo pacman -S ffmpeg"
        exit 1
        ;;
esac

# Provera instalacije
echo ""
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg uspešno instaliran!"
    echo "📌 Verzija: $(ffmpeg -version | head -n 1 | cut -d' ' -f3)"
    echo ""
    echo "🎉 Thumbnail generisanje je sada omogućeno!"
    echo "Restartujte server da bi aktivirali funkcionalnost."
    echo ""
    exit 0
else
    echo "❌ FFmpeg nije pronađen nakon instalacije."
    echo "Molimo proverite grešku iznad i pokušajte ručno."
    exit 1
fi
