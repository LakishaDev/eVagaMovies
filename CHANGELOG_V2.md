# 🎬 eVagaMovies v2.0 - Custom Thumbnail Capture

## Što se Novo Dodalo? 🆕

### Backend Enhancements

#### 📦 Novi Fajlovi

- **`thumbnail-batch-agent.js`** - Batch operations za thumbnail-e

  - `regenerateAllThumbnails()` - Regeneriši sve nedostajuće
  - `regenerateSingleThumbnail(id)` - Regeneriši jedan
  - `getThumbnailStats()` - Statistika thumbnail-a
  - `getMoviesWithoutThumbnail()` - Pronađi bez thumbnail-a
  - `deleteThumbnail(id)` - Obriši thumbnail

- **`config.js`** - Centralizovane konfiguracije
  - `PORT`, `HOST`, `MOVIES_PATH`
  - `THUMBNAILS_DIR`, `DB_PATH`
  - `THUMBNAIL_SETTINGS` - Rezolucija, kvalitet
  - `VIDEO_SETTINGS` - Stream settings

#### 🔧 Izmjene u Postojećim Fajlovima

**`thumbnail-agent.js`** - Prošireno sa:

```javascript
// Capture frame na specifičnom vremenu
captureFrameAtTime(videoPath, timestamp, outputFilename);

// Dobij video info (trajanje, codec, rezolucija, itd.)
getVideoInfo(videoPath);
```

**`database.js`** - Dodan:

```javascript
// Update thumbnail putanju za film
updateMovieThumbnail(id, thumbnailPath);

// Batch update više thumbnail-a odjednom
batchUpdateThumbnails(updates);
```

**`server.js`** - Dodani endpoint-i:

```
POST   /api/movies/:id/capture-thumbnail      ✨ NOVI
GET    /api/video-info/:id                    ✨ NOVI
GET    /api/thumbnail-stats                   ✨ NOVI
GET    /api/movies-without-thumbnail          ✨ NOVI
POST   /api/regenerate-all-thumbnails         ✨ NOVI
POST   /api/movies/:id/regenerate-thumbnail   ✨ NOVI
DELETE /api/movies/:id/thumbnail              ✨ NOVI
```

### Frontend Enhancements

#### 📦 Novi Komponenti

- **`ThumbnailSelector.jsx`** - UI za capture frame-a

  - Prikaz trenutnog vremena videa
  - Input za unos specifičnog vremena (MM:SS ili HH:MM:SS)
  - Live preview nakon capture-a
  - Success/Error poruke

- **`ThumbnailManager.jsx`** - Admin dashboard
  - Thumbnail statistika
  - Progress bar za pokrivanje
  - Button za batch regenerisanje
  - Real-time statistika

#### 📄 Nove Stranice

- **`AdminPage.jsx`** - Admin panel (`/admin`)
  - Thumbnail Manager integracija
  - API dokumentacija
  - Dostupni alati pregled

#### 🔗 API Update-ovi

**`api.js`** - Dodan:

```javascript
// Capture frame na specifičnom vremenu
captureFrameAtTime(movieId, timestamp);
captureThumbnail(movieId, timestamp); // Alias

// Dobij video info
getVideoInfo(movieId);
```

#### 🎨 Komponente Izmjene

**`CustomVideoPlayer.jsx`** - Prošireno sa:

```javascript
// Forward ref za pristup video elementu
useImperativeHandle(
  ref,
  () => ({
    videoElement: videoRef.current,
  }),
  []
);

// Callback za promjenu durationa
onDurationChange(duration);
```

**`MoviePlayer.jsx`** - Dodano:

```jsx
// ThumbnailSelector integracija
<ThumbnailSelector movieId={id} videoRef={videoRef} duration={videoDuration} />
```

**`App.jsx`** - Dodan route:

```jsx
<Route path="/admin" element={<AdminPage />} />
```

### 📊 API Dokumentacija

| Endpoint                               | Metoda | Opis                     |
| -------------------------------------- | ------ | ------------------------ |
| `/api/movies/:id/capture-thumbnail`    | POST   | Capture frame na vremenu |
| `/api/video-info/:id`                  | GET    | Video metadata           |
| `/api/thumbnail-stats`                 | GET    | Thumbnail statistika     |
| `/api/movies-without-thumbnail`        | GET    | Filmovi bez thumbnail-a  |
| `/api/regenerate-all-thumbnails`       | POST   | Batch regeneracija       |
| `/api/movies/:id/regenerate-thumbnail` | POST   | Regeneriši jedan         |
| `/api/movies/:id/thumbnail`            | DELETE | Obriši thumbnail         |

### 📚 Dokumentacija

Dodan:

- **`CUSTOM_THUMBNAIL_GUIDE.sh`** - Quick start guide (bash)
- **`CUSTOM_THUMBNAIL_FEATURE_GUIDE.md`** - Detaljni guide (markdown)
- **`test-custom-thumbnail.js`** - Unit test-ovi
- **`CHANGELOG.md`** - Ovaj fajl

## Kako Koristi? 🚀

### Osnovna Upotreba (Frontend)

1. Otiđi na film: `http://localhost:5173/movie/1`
2. Pauzira video gdje želiš naslovnicu
3. U "Prilagođeni Thumbnail" sekciji, klikni "Koristi Trenutno Vrijeme"
4. Čekaj ~2 sekunde - video će se refresh-ovati

### Napredna Upotreba (API)

```bash
# Capture frame u 2. minuti
curl -X POST http://localhost:3001/api/movies/1/capture-thumbnail \
  -H "Content-Type: application/json" \
  -d '{"timestamp": 120}'

# Pronađi sve filmove bez thumbnail-a
curl http://localhost:3001/api/movies-without-thumbnail

# Regeneriši sve batch-om
curl -X POST http://localhost:3001/api/regenerate-all-thumbnails
```

### Admin Panel

```
http://localhost:5173/admin
```

Dostupno:

- 📊 Thumbnail statistika
- 🔄 Batch regenerisanje
- 📋 API dokumentacija

## ✨ Prednosti

✅ **Potpuna Kontrola** - Sami odabiraš frame  
✅ **Zero Manual Work** - Nema ručnog uploada  
✅ **Batch Operations** - Brzo za ~100 filmova  
✅ **Live Preview** - Vidiš preview prije sprema  
✅ **Statistics** - Pregled pokrivanja  
✅ **Graceful Degradation** - Preskače nekompatibilne

## 🔧 Tehnikalnosti

**Backend Stack:**

- Express.js - API server
- FFmpeg - Video processing
- better-sqlite3 - Database
- iconv-lite - Encoding

**Frontend Stack:**

- React 19 - UI framework
- Tailwind CSS - Styling
- Lucide Icons - Icons
- Vite - Build tool

## ⚠️ Known Issues

- [ ] Admin panel nema authentication (TODO)
- [ ] Batch regeneracija ne može biti otkazana
- [ ] Geen support za WebP format
- [ ] SVG preview neće raditi

## 🔮 Budućnost

- [ ] Authentication za Admin
- [ ] Multiple thumbnails per film
- [ ] Video preview (motion thumbnails)
- [ ] Custom thumbnail templates
- [ ] WebP/AVIF support
- [ ] Drag & drop thumbnail upload
- [ ] Thumbnail history/versioning

## 🐛 Bugovi

Ako naiđeš na bug, provjeri:

1. Je li FFmpeg instaliran? `ffmpeg -version`
2. Server log: `tail -f logs/server.log`
3. Browser console: F12 → Console tab
4. Network tab: Vidi da li se API zahtjev šalje

## 📞 Podrška

Dokumentacija:

- `/CUSTOM_THUMBNAIL_FEATURE_GUIDE.md` - Detaljni guide
- `/CUSTOM_THUMBNAIL_GUIDE.sh` - Brzi start
- `http://localhost:5173/admin` - API docs

## 📝 Changelog

### v2.0 (27. januar 2026)

- ✨ Custom thumbnail capture
- ✨ Batch operations
- ✨ Admin panel
- ✨ Video info endpoint
- 🎨 ThumbnailSelector component
- 🎨 ThumbnailManager component
- 📊 Thumbnail statistics
- 🔧 Config centralization
- 📚 Comprehensive documentation

---

**eVagaMovies** - Powered by Custom Thumbnail Agent v2.0 🚀
