# 🤖 FFmpeg Auto-Installer Agent

Automatski agent koji detektuje operativni sistem i instalira FFmpeg za omogućavanje automatskog generisanja thumbnail slika.

## 🚀 Quick Start - Rešenje Problema

**Problem**: ⚠️ FFmpeg not found. Thumbnail generation will be disabled.

**Rešenje**: Pokrenite installer agenta:

```bash
# Opcija 1: Bash script (Brzo i jednostavno)
./install-ffmpeg.sh

# Opcija 2: Direktna instalacija (Fedora)
sudo dnf install -y ffmpeg

# Opcija 3: Node.js agent
cd backend
node ffmpeg-installer.js
```

## 📦 Dostupni Agenti

### 1. 🛠️ **FFmpeg Installer** (`install-ffmpeg.sh`)
Automatski instalira FFmpeg na osnovu detektovanog OS-a.

```bash
./install-ffmpeg.sh
```

### 2. 🧪 **Thumbnail Test Agent** (`backend/test-thumbnail-agent.js`)
Testira thumbnail generisanje i dijagnostikuje probleme.

```bash
cd backend
node test-thumbnail-agent.js
```

### 3. 🎨 **Thumbnail Auto-Generator** (`backend/thumbnail-auto-gen.js`)
Automatski generiše thumbnail-e za sve filmove koji ih nemaju.

```bash
cd backend

# Proveri koliko filmova nema thumbnail
node thumbnail-auto-gen.js --check

# Generiši prvih 10
node thumbnail-auto-gen.js --limit 10

# Generiši sve thumbnail-e
node thumbnail-auto-gen.js --all

# Pomoć
node thumbnail-auto-gen.js --help
```

### 4. 🔄 **Server Restart** (`restart-server.sh`)
Restartuje server nakon izmena.

```bash
./restart-server.sh
```

## 🎯 Tipičan Workflow

### Scenario 1: Prva instalacija (bez FFmpeg-a)
```bash
# 1. Instaliraj FFmpeg
./install-ffmpeg.sh

# 2. Testiraj da radi
cd backend
node test-thumbnail-agent.js

# 3. Generiši thumbnail-e za sve filmove
node thumbnail-auto-gen.js --all

# 4. Restartuj server
cd ..
./restart-server.sh
```

### Scenario 2: Server već radi, thumbnail-i se ne generišu
```bash
# 1. Dijagnoza problema
cd backend
node test-thumbnail-agent.js

# Ako FFmpeg nije dostupan:
cd ..
./install-ffmpeg.sh

# 2. Generiši missing thumbnails
cd backend
node thumbnail-auto-gen.js --all

# 3. Restartuj server
cd ..
./restart-server.sh
```

### Scenario 3: Dodao nove filmove
```bash
# 1. Proveri koliko novih filmova nema thumbnail
cd backend
node thumbnail-auto-gen.js --check

# 2. Generiši samo za nove filmove
node thumbnail-auto-gen.js --limit 5

# 3. Server će automatski prepoznati nove thumbnail-e
# (nije potreban restart ako koristiš scanner endpoint)
```

## 📋 Šta Agent Radi?

### Install Agent
1. ✅ Detektuje da li je FFmpeg već instaliran
2. ✅ Prepoznaje operativni sistem automatski
3. ✅ Instalira FFmpeg korišćenjem odgovarajućeg package manager-a
4. ✅ Verifikuje uspešnu instalaciju
5. ✅ Prikazuje verziju i status

### Test Agent
1. ✅ Proverava FFmpeg dostupnost
2. ✅ Pronalazi test film u bazi
3. ✅ Verifikuje video fajl
4. ✅ Generiše test thumbnail
5. ✅ Verifikuje generisani fajl
6. ✅ Prikazuje detaljnu dijagnostiku

### Auto-Gen Agent
1. ✅ Skenira bazu za filmove bez thumbnail-a
2. ✅ Prikazuje progress bar
3. ✅ Generiše thumbnail-e u batch-u
4. ✅ Prikazuje statistiku (uspešno/neuspešno)
5. ✅ Automatski cleanup starih thumbnail-a

## 🔧 Podržani Operativni Sistemi

| OS | Package Manager | Komanda |
|----|----------------|---------|
| **Fedora** ⭐ | DNF | `sudo dnf install -y ffmpeg` |
| Ubuntu/Debian | APT | `sudo apt install -y ffmpeg` |
| Arch Linux | Pacman | `sudo pacman -S --noconfirm ffmpeg` |
| RHEL/CentOS | YUM | `sudo yum install -y ffmpeg` |
| macOS | Homebrew | `brew install ffmpeg` (manual) |
| Windows | - | Manual download |

## 📂 Struktura Projekta

```
eVagaMovies/
├── install-ffmpeg.sh                 # 🛠️  FFmpeg installer
├── restart-server.sh                 # 🔄 Server restart
├── backend/
│   ├── ffmpeg-installer.js          # 🛠️  Node.js installer
│   ├── thumbnail-agent.js           # 🎨 Core thumbnail generator
│   ├── test-thumbnail-agent.js      # 🧪 Test & diagnostics
│   ├── thumbnail-auto-gen.js        # 🤖 Auto-generator
│   └── generated-thumbnails/        # 📁 Generated files
│       └── movie-*.jpg
└── FFMPEG_AGENT.md                  # 📖 Ova dokumentacija
```

## 🎯 Primeri Korišćenja

### Primer 1: Setup od nule
```bash
# Clone projekta
git clone <repo>
cd eVagaMovies

# Install dependencies
npm install
cd backend && npm install && cd ..

# Install FFmpeg automatski
./install-ffmpeg.sh

# Test
cd backend && node test-thumbnail-agent.js

# Generiši sve thumbnail-e
node thumbnail-auto-gen.js --all

# Pokreni server
cd .. && ./start.sh
```

### Primer 2: Provera statusa
```bash
# Da li je FFmpeg instaliran?
ffmpeg -version

# Koliko filmova nema thumbnail?
cd backend
node thumbnail-auto-gen.js --check

# Test thumbnail generisanja
node test-thumbnail-agent.js
```

### Primer 3: Batch generisanje
```bash
cd backend

# Generiši polako (10 po batch-u)
node thumbnail-auto-gen.js --limit 10

# Pauza, proveri rezultate...
ls -lh generated-thumbnails/

# Nastavi sa sledećih 10
node thumbnail-auto-gen.js --limit 10

# Na kraju, generiši sve preostale
node thumbnail-auto-gen.js --all
```

## ✅ Provera Instalacije

### FFmpeg Instaliran?
```bash
ffmpeg -version
```

Trebalo bi da vidite:
```
ffmpeg version 6.x.x ...
```

### Thumbnail Agent Radi?
```bash
cd backend
node test-thumbnail-agent.js
```

Očekivani output:
```
✅ FFmpeg is available
✅ Found: <movie name>
✅ Thumbnail generated successfully!
🎉 All tests passed!
```

## 🐛 Troubleshooting

### Problem: "FFmpeg not available"
```bash
# Rešenje 1: Instaliraj
./install-ffmpeg.sh

# Rešenje 2: Proveri instalaciju
ffmpeg -version

# Rešenje 3: Restartuj terminal
source ~/.bashrc
```

### Problem: "Thumbnail generation failed"
```bash
# Dijagnoza
cd backend
node test-thumbnail-agent.js

# Proveri logove
tail -f ../server.log

# Proveri permissions
ls -la generated-thumbnails/
```

### Problem: "No movies found"
```bash
# Proveri MOVIES_PATH u .env
cat backend/.env

# Test sa ispravnim path-om
cd backend
MOVIES_PATH=/data/movies node test-thumbnail-agent.js
```

### Problem: Thumbnail se ne prikazuje u frontend-u
```bash
# 1. Da li je generisan?
ls -la backend/generated-thumbnails/

# 2. Restartuj server
./restart-server.sh

# 3. Očisti browser cache
# Ctrl+F5 u browseru
```

## 🔐 Sigurnost

⚠️ **Važno**: Installer agenti koriste `sudo` za instalaciju sistema paketa.

- Bash script traži sudo lozinku interaktivno
- Preporuka: Pregledajte kod pre pokretanja
- Alternative: Ručna instalacija bez agenta

## 📊 Performance

| Metrika | Vrednost |
|---------|----------|
| FFmpeg instalacija | ~30-60 sekundi |
| FFmpeg veličina | ~50-100 MB |
| Thumbnail generisanje | ~2-5 sekundi po filmu |
| Thumbnail veličina | ~100-300 KB (1280x720) |
| Batch processing | ~10-20 filmova/minut |

## 🎉 Nakon Uspešne Instalacije

Videćete:
```
✅ FFmpeg uspešno instaliran!
📌 Verzija: 7.x.x
🎉 Thumbnail generisanje je sada omogućeno!
```

Zatim:
```bash
# Generiši thumbnail-e
cd backend
node thumbnail-auto-gen.js --all

# Pokreni server
cd ..
./restart-server.sh

# Uživaj! 🎬
```

## 🔗 Povezani Fajlovi

- `THUMBNAIL_AGENT.md` - Dokumentacija thumbnail generatora
- `FFMPEG_SETUP.md` - Manuelne instalacione instrukcije
- `backend/thumbnail-agent.js` - Core implementacija
- `backend/scanner.js` - Integracija sa scanner-om

## 💡 Tips & Tricks

### Automatsko generisanje pri svakom scan-u
Scanner automatski generiše thumbnail-e tokom skeniranja.
Nije potrebno pokretati auto-gen agent svaki put.

### Batch processing za velike kolekcije
```bash
# Generiši postepeno da ne preopterećuješ sistem
node thumbnail-auto-gen.js --limit 50
sleep 60
node thumbnail-auto-gen.js --limit 50
```

### Regenerisanje lošeg thumbnail-a
```bash
# Obriši thumbnail fajl
rm generated-thumbnails/movie-xyz123.jpg

# Ponovo skeniraj ili generiši
node thumbnail-auto-gen.js --all
```

### Monitoring generisanja
```bash
# Terminal 1: Pokreni generisanje
cd backend
node thumbnail-auto-gen.js --all

# Terminal 2: Prati progress
watch -n 1 'ls -lh generated-thumbnails/ | tail -n 5'
```

## 📝 Licenca

FFmpeg je licenciran pod LGPL/GPL zavisno od build konfiguracije.
Ovi installer agenti su deo eVagaMovies projekta.

---

**🎬 Sretno sa thumbnail generisanjem!**

Za pomoć: `node thumbnail-auto-gen.js --help`

