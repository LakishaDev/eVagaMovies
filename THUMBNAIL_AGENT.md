# 🎬 Automatsko Generisanje Thumbnail Slika

## Pregled

eVagaMovies sada automatski generiše thumbnail/naslovna slike za filmove koji ih nemaju koristeći **Thumbnail Agent** sa FFmpeg-om.

## Kako Radi?

### 1. **Automatska Detekcija**
Prilikom skeniranja filmova, sistem:
- Prvo traži postojeće thumbnail slike (`naslovna.jpg`, `poster.jpg`, `cover.jpg`, itd.)
- Ako **NE postoji** thumbnail slika:
  - Proverava da li je FFmpeg dostupan
  - Ako jeste, automatski generiše thumbnail iz video fajla

### 2. **Pametno Generisanje**
Thumbnail agent:
- Dohvata trajanje celog videa
- Bira **random vreme** između 10% i 40% trajanja
  - Izbegava početak (intro/titlovi)
  - Izbegava kraj (outro/titlovi)
- Ekstraktuje frame u **1280x720 HD rezoluciji**
- Čuva sliku u `backend/generated-thumbnails/`

### 3. **Automatsko Serviranje**
Server prepoznaje:
- **Postojeći thumbnails**: Servira iz `/movies/` foldera
- **Generisani thumbnails**: Servira iz `backend/generated-thumbnails/`

## Instalacija FFmpeg-a

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

### Fedora:
```bash
sudo dnf install ffmpeg
```

### Arch Linux:
```bash
sudo pacman -S ffmpeg
```

### MacOS (Homebrew):
```bash
brew install ffmpeg
```

### Windows:
Preuzmite sa https://ffmpeg.org/download.html i dodajte u PATH

### Provera instalacije:
```bash
ffmpeg -version
```

## Agent Arhitektura

### `thumbnail-agent.js` - Samostalni Agent
```javascript
// Provera dostupnosti FFmpeg-a
isFfmpegAvailable()

// Generisanje thumbnail-a
generateThumbnail(videoPath, outputFilename)

// Cleanup starih thumbnail-a
cleanupOldThumbnails(daysOld)

// Generisanje unique ID-a
getThumbnailFilename(movieId)
```

### Integracija u Scanner
Scanner koristi agent tokom skeniranja:
```javascript
// scanner.js
if (!thumbnailFile && isFfmpegAvailable()) {
  relativeThumbnailPath = await generateThumbnail(videoPath, filename);
}
```

## Primeri Korišćenja

### 1. Automatsko skeniranje sa generisanjem
```bash
cd backend
npm start
```
Server će automatski:
- Skenirati filmove
- Detektovati koji nemaju thumbnail
- Generisati ih u pozadini

### 2. Manuelno generisanje
```javascript
import { generateThumbnail, getThumbnailFilename } from './thumbnail-agent.js';

const videoPath = '/path/to/movie.mp4';
const filename = getThumbnailFilename('unique-movie-id');
const thumbPath = await generateThumbnail(videoPath, filename);
console.log('Generated:', thumbPath);
```

### 3. Cleanup starih thumbnail-a
```javascript
import { cleanupOldThumbnails } from './thumbnail-agent.js';

// Briše fajlove starije od 30 dana
cleanupOldThumbnails(30);
```

## Struktura Thumbnail Foldera

```
backend/
├── generated-thumbnails/
│   ├── movie-abc123-1234567890.jpg
│   ├── movie-def456-1234567891.jpg
│   └── movie-ghi789-1234567892.jpg
└── thumbnail-agent.js
```

## Prednosti Ovog Pristupa

1. **Zero Manual Work**: Nema potrebe za ručnim dodavanjem postera
2. **Visual Preview**: Korisnici vide sadržaj filma umesto praznine
3. **Random Scene**: Svaki thumbnail je unikatan frame iz filma
4. **HD Kvalitet**: 1280x720 rezolucija
5. **Cache Friendly**: Jednom generisan, keširan zauvek
6. **Graceful Degradation**: Ako FFmpeg nije dostupan, jednostavno nema thumbnail-a

## Performance

- **Generisanje**: ~2-5 sekundi po filmu
- **Storage**: ~100-300KB po thumbnail-u
- **Caching**: 24h browser cache + postojan fajl na serveru

## Fallback Ponašanje

Ako FFmpeg **NIJE** instaliran:
```
⚠️  No thumbnail found (FFmpeg not available)
```

Film će i dalje biti prikazan, samo bez thumbnail slike.

## Troubleshooting

### Problem: Thumbnails se ne generišu
**Rešenje**: Instaliraj FFmpeg i restartuj server
```bash
sudo apt install ffmpeg  # Linux
cd backend && npm start
```

### Problem: Thumbnail je crna slika
**Razlog**: Random vreme palo na crnu scenu  
**Rešenje**: Obriši thumbnail i ponovno skeniraj (novi random frame)

### Problem: Slow scanning
**Razlog**: Generisanje thumbnail-a traje  
**Rešenje**: Normalno - prvi scan traje duže, kasnije je instant

## Budući Razvoj

Moguća unapređenja:
- [ ] Bulk regeneration endpoint
- [ ] Thumbnail kvalitet opcije (720p, 1080p, 4K)
- [ ] Multiple frames selection
- [ ] AI-based best frame detection
- [ ] Thumbnail preview u admin panelu

## Licenca

Ova funkcionalnost koristi:
- **fluent-ffmpeg**: MIT License
- **FFmpeg**: LGPL/GPL (zavisno od build-a)
