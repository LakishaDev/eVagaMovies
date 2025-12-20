#!/bin/bash

# eVagaMovies - Quick Commands Cheatsheet

cat << 'EOF'
╔══════════════════════════════════════════════════════════╗
║     eVagaMovies - Thumbnail Agent Quick Commands        ║
╚══════════════════════════════════════════════════════════╝

🔧 SETUP (jednokratno)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ./install-ffmpeg.sh
  # Instalira FFmpeg automatski

🧪 TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cd backend && node test-thumbnail-agent.js
  # Testira da thumbnail generisanje radi

📊 STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cd backend && node thumbnail-auto-gen.js --check
  # Koliko filmova nema thumbnail?

🎨 GENERISANJE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cd backend
  
  # Prvi batch (test)
  node thumbnail-auto-gen.js --limit 5
  
  # Batch po batch
  node thumbnail-auto-gen.js --limit 20
  
  # SVE ODJEDNOM
  node thumbnail-auto-gen.js --all

🔄 RESTART SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ./restart-server.sh
  # Nakon generisanja thumbnail-a

🔍 DEBUG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Proveri FFmpeg
  ffmpeg -version
  
  # Vidi generisane thumbnail-e
  ls -lh backend/generated-thumbnails/
  
  # Broj thumbnail-a
  ls backend/generated-thumbnails/ | wc -l
  
  # Server logovi
  tail -f server.log
  
  # Da li server radi?
  ps aux | grep node

📁 STRUKTURA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  backend/generated-thumbnails/  ← Ovde se čuvaju thumbnail-i
  backend/test-thumbnail-agent.js ← Test
  backend/thumbnail-auto-gen.js  ← Generator
  install-ffmpeg.sh              ← Installer

📖 DOKUMENTACIJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SOLUTION_SUMMARY.md      ← START OVDE!
  FFMPEG_AGENT.md          ← Kompletni vodič
  THUMBNAIL_FIX.md         ← Quick fix
  ERROR_HANDLING_FIX.md    ← Skip problematic videos ⭐NEW

💡 TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Prati progress u real-time
  watch -n 1 'ls backend/generated-thumbnails/ | wc -l'
  
  # Regenerisanje lošeg thumbnail-a
  rm backend/generated-thumbnails/movie-xyz-*.jpg
  cd backend && node thumbnail-auto-gen.js --all
  
  # Re-scan sve (alternativa)
  rm backend/movies.db
  ./restart-server.sh
  
  # NOVO: Problematični video se automatski preskače ✅
  # Agent sada NIKAD ne crashuje - samo preskače nepodržane formate

🎯 TIPIČAN WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. cd backend
  2. node test-thumbnail-agent.js     # Test
  3. node thumbnail-auto-gen.js --all # Generiši
  4. cd .. && ./restart-server.sh     # Restart
  5. GOTOVO! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Za pomoć:
  cd backend && node thumbnail-auto-gen.js --help
  
Uživaj! 🎬

EOF
