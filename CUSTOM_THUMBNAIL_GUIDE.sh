#!/bin/bash

# 🎬 eVagaMovies - Custom Thumbnail Capture Feature
# QUICK START GUIDE

echo "═══════════════════════════════════════════════════════════════"
echo "  🎬 eVagaMovies - Custom Thumbnail Capture (v2.0)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. START SERVER
echo "📌 KORAK 1: Startuj server"
echo "   cd /home/lakisha/eVagaMovies"
echo "   npm start"
echo ""

# 2. OPEN FRONTEND
echo "📌 KORAK 2: Otvori frontend"
echo "   http://localhost:5173"
echo ""

# 3. NAVIGATE TO MOVIE
echo "📌 KORAK 3: Otiđi na film (npr. MoviePlayer)"
echo "   - Klikni na bilo koji film"
echo "   - Prikazat će se video player sa thumbnail selector-om"
echo ""

# 4. CAPTURE THUMBNAIL
echo "📌 KORAK 4: Napravi custom thumbnail"
echo "   OPCIJA A: Koristi Trenutno Vrijeme"
echo "   - Pauzira video na mjestu gdje želiš naslovnicu"
echo "   - Klikni 'Koristi Trenutno Vrijeme'"
echo ""
echo "   OPCIJA B: Unesi Specifično Vrijeme"
echo "   - Unesi vrijeme u format MM:SS ili HH:MM:SS"
echo "   - Klikni 'Napravi'"
echo ""

# 5. ADMIN PANEL
echo "📌 KORAK 5: Admin Panel (Batch Operations)"
echo "   http://localhost:5173/admin"
echo ""
echo "   Dostupno:"
echo "   ✅ Thumbnail Statistics - Vidi statistiku thumbnail-a"
echo "   ✅ Regenerate All - Regeneriši sve nedostajuće thumbnail-e"
echo "   ✅ API Documentation - Pregled svih endpoint-a"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  📚 API DOKUMENTACIJA"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "🎥 CAPTURE THUMBNAIL NA SPECIFIČNOM VREMENU"
echo "   POST /api/movies/:id/capture-thumbnail"
echo "   Body: { \"timestamp\": 120 }"
echo "   Response: { thumbnail_path, timestamp, message }"
echo ""

echo "📊 VIDEO INFORMACIJE"
echo "   GET /api/video-info/:id"
echo "   Response: { filename, duration, width, height, codec, fps }"
echo ""

echo "📈 THUMBNAIL STATISTIKA"
echo "   GET /api/thumbnail-stats"
echo "   Response: { totalMovies, withThumbnail, withoutThumbnail, generatedThumbnails }"
echo ""

echo "🔄 REGENERIŠI SVE NEDOSTAJUĆE THUMBNAIL-E"
echo "   POST /api/regenerate-all-thumbnails"
echo "   Pokreće batch operaciju u background-u"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  💡 SAVJETI"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Thumbnail se automatski UpdateUpdate-a u bazi nakon capture-a"
echo "2. Svaki custom thumbnail dobija unique ID sa timestamp-om"
echo "3. Batch regeneration će preskočiti nekompatibilne formate"
echo "4. Video info prikazuje detaljne metapodatke o videu"
echo "5. Server log pokazuje sve operacije sa thumbnail-ima"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ READY TO USE!"
echo "═══════════════════════════════════════════════════════════════"
