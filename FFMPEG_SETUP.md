# Instalacija FFmpeg-a

FFmpeg nije instaliran na sistemu. Da bi thumbnail generator radio, potrebno je instalirati FFmpeg.

## Instalacija na različitim sistemima:

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
1. Preuzmite FFmpeg sa https://ffmpeg.org/download.html
2. Ekstraktujte i dodajte u PATH environment variable

## Provera instalacije:
```bash
ffmpeg -version
```

## Kako radi Thumbnail Agent?

Thumbnail agent automatski:
1. Detektuje da li film ima postojeću thumbnail sliku (naslovna.jpg, poster.jpg, itd.)
2. Ako NE postoji thumbnail, generiše ga iz videa:
   - Dohvata trajanje videa
   - Bira random vreme između 10% i 40% trajanja (izbegava intro/outro)
   - Ekstraktuje frame u 1280x720 rezoluciji
   - Čuva ga u `backend/generated-thumbnails/` direktorijumu
3. Server automatski prepoznaje da li je thumbnail generisan ili postojeći

## Posebne funkcije:

### Cleanup starih thumbnail-a
```javascript
import { cleanupOldThumbnails } from './thumbnail-agent.js';

// Briše thumbnail-e starije od 30 dana
cleanupOldThumbnails(30);
```

### Manuelno generisanje
```javascript
import { generateThumbnail, getThumbnailFilename } from './thumbnail-agent.js';

const videoPath = '/path/to/movie.mp4';
const filename = getThumbnailFilename('unique-id');
const thumbnailPath = await generateThumbnail(videoPath, filename);
```

## Testiranje

Nakon instalacije FFmpeg-a:

```bash
cd backend
npm start
```

Server će automatski skenirati filmove i generisati thumbnail-e za one koji ih nemaju.
