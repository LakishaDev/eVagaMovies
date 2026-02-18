# 🎬 Custom Thumbnail Capture System v2.0

## Što se promijenilo?

Umjesto da se thumbnail-i automatski generiraju na random poziciji, **sada možeš sam odabrati trenutak u videu** i kliknom napraviti thumbnail od tog frame-a!

## ✨ Nove Feature-e

### 1. **Frontend Thumbnail Selector**

- Pauziras video na željenom mjestu
- Klikneš "Koristi Trenutno Vrijeme"
- Ili unesis specifično vrijeme (MM:SS ili HH:MM:SS)
- Thumbnail se automatski generiše i sprema u bazu

### 2. **Batch Thumbnail Manager** (Admin Panel)

- Pregled svih thumbnail statistike
- Regenerisanje svih nedostajućih thumbnail-a
- Progress tracking
- API documentation

### 3. **Thumbnail Batch Agent**

- Programatski batch operations
- `regenerateAllThumbnails()` - Regeneriši sve
- `regenerateSingleThumbnail(id)` - Regeneriši jedan
- `getThumbnailStats()` - Statistika
- `getMoviesWithoutThumbnail()` - Pronađi bez thumbnail-a

## 🎯 Kako Koristiti

### Na Frontendu (Jednostavno)

1. **Otvori bilo koji film**

   ```
   http://localhost:5173/movie/1
   ```

2. **Skroluj do "Prilagođeni Thumbnail" sekcije** (ispod video player-a)

3. **Pauzira video gdje želiš naslovnicu**

4. **Klikni "Koristi Trenutno Vrijeme"** ili unesi vrijeme ručno

5. **Video će se refresh-ovati sa novim thumbnail-om** (nakon ~2-3 sekunde)

### Na Backend-u (Programatski)

```javascript
// Regeneriši sve thumbnail-e
import { regenerateAllThumbnails } from "./thumbnail-batch-agent.js";

const stats = await regenerateAllThumbnails((progress) => {
  console.log(`${progress.current}/${progress.total} - ${progress.movie}`);
});

console.log(`Generated: ${stats.generated}, Failed: ${stats.failed}`);
```

### Via REST API

```bash
# Capture frame na specifičnom vremenu
curl -X POST http://localhost:3001/api/movies/1/capture-thumbnail \
  -H "Content-Type: application/json" \
  -d '{"timestamp": 120}'

# Dobij video info
curl http://localhost:3001/api/video-info/1

# Thumbnail statistika
curl http://localhost:3001/api/thumbnail-stats

# Regeneriši sve
curl -X POST http://localhost:3001/api/regenerate-all-thumbnails

# Pronađi sve bez thumbnail-a
curl http://localhost:3001/api/movies-without-thumbnail
```

## 📁 Što se dodalo?

### Backend Fajlovi

- `thumbnail-batch-agent.js` - Batch operacije
- `config.js` - Centralizovane konfiguracije
- `database.js` - Nove funkcije: `updateMovieThumbnail()`, `batchUpdateThumbnails()`
- `thumbnail-agent.js` - Nove funkcije: `captureFrameAtTime()`, `getVideoInfo()`

### Frontend Fajlovi

- `ThumbnailSelector.jsx` - UI za capture
- `ThumbnailManager.jsx` - Admin panel sa statistikama
- `AdminPage.jsx` - Admin dashboard

### API Endpoint-i

```
POST   /api/movies/:id/capture-thumbnail      - Capture frame
GET    /api/video-info/:id                    - Video metadata
GET    /api/thumbnail-stats                   - Statistika
GET    /api/movies-without-thumbnail          - Lista bez thumbnail-a
POST   /api/regenerate-all-thumbnails         - Batch regeneracija
POST   /api/movies/:id/regenerate-thumbnail   - Regeneriši jedan
DELETE /api/movies/:id/thumbnail              - Obriši thumbnail
```

## 🎨 UI Pregled

### MoviePlayer Page

```
┌─────────────────────────────────────────┐
│  VIDEO PLAYER                           │
├─────────────────────────────────────────┤
│ Film informacije (Godina, Kvalitet, itd)│
├─────────────────────────────────────────┤
│                                         │
│  🎬 PRILAGOĐENI THUMBNAIL               │
│  ┌──────────────────────────────────┐   │
│  │ Trenutno vrijeme: 120s / 180s    │   │
│  │ [Koristi Trenutno Vrijeme]       │   │
│  │                                  │   │
│  │ Ili unesi vrijeme (MM:SS):       │   │
│  │ [1:23] [Napravi]                 │   │
│  │                                  │   │
│  │ ✅ Thumbnail je uspješno...      │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Admin Page

```
┌─────────────────────────────────────────┐
│  🎬 Admin Panel                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Ukupno: 150  |  Sa: 140  |  Bez: 10│
│  │ Generisani: 95                   │   │
│  │ [==============] 93%             │   │
│  │ [Regeneriši Sve (10)]            │   │
│  └──────────────────────────────────┘   │
│                                         │
│  📌 Dostupni Alati:                     │
│  ✅ Thumbnail Regeneration              │
│  ✅ Thumbnail Capture                   │
│  ✅ Video Info                          │
│  ✅ Batch Operations                    │
│                                         │
│  🔌 API Endpoint-i: [Dokumentacija]     │
└─────────────────────────────────────────┘
```

## ⚡ Performance

- **Capture frame**: ~1-2 sekunde
- **Regenerisanje batch-a**: ~2-5 sekundi po filmu
- **Batch od 100 filmova**: ~5-10 minuta

## 🔒 Sigurnost

⚠️ **TODO**: Dodaj authentication za Admin Panel (trenutno je javno!)

```javascript
// Future: Dodaj middleware
app.use("/api/admin/*", authMiddleware);
```

## 🐛 Troubleshooting

### Thumbnail se ne generiše

- ✅ Provjeri da je FFmpeg instaliran: `ffmpeg -version`
- ✅ Provjeri server log za greške
- ✅ Neki codec-i nisu podržani (preskače se automatski)

### "Nevaljano vrijeme!"

- ✅ Koristi format MM:SS ili HH:MM:SS
- ✅ Vrijeme mora biti manje od trajanja videa

### Batch regeneracija traje predugo

- ✅ To je normalno - traje ~5-10 minuta za ~100 filmova
- ✅ Ide se u background, možeš nastaviti sa ostalim

## 📊 Prednosti

1. **Potpuna Kontrola** - Sami odabiraš koji frame je naslovnica
2. **Zero Manual Work** - Nema ručnog dodavanja slika
3. **Visual Preview** - Prikazuje preview prije spremanja
4. **Batch Operations** - Brzo regenerisanje svih odjednom
5. **Statistics** - Pregled pokrivanja thumbnail-a
6. **Progress Tracking** - Live feedback tijekom operacija

## 🔮 Što se može dalje poboljšati?

- [ ] Authentication za Admin Panel
- [ ] Multiple thumbnail capture per film (gallery)
- [ ] Batch edit (preselect multiple movies)
- [ ] Thumbnail preview upload
- [ ] Auto-optimize thumbnail size
- [ ] Custom thumbnail templates
- [ ] WebP format support
- [ ] Thumbnails sa motion (video preview)

## 📞 Podrška

Vidi `/api/thumbnail-stats` i `/admin` za detaljne informacije!
