# 🎬 eVagaMovies

Lokalni movie streaming server za gledanje filmova na lokalnoj mreži. Web aplikacija koja automatski skenira foldere sa filmovima i omogućava video streaming sa podrškom za subtitle.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

## 📋 O Projektu

eVagaMovies je self-hosted rešenje za organizovanje i gledanje filmova preko lokalne mreže. Aplikacija automatski skenira folderske strukture, parsira imena filmova, ekstraktuje metadata i omogućava streaming direktno u browseru.

### ✨ Glavne Funkcionalnosti

- 🎥 **Video Streaming** - Direktan streaming iz file sistema
- 📝 **Subtitle Podrška** - Automatsko učitavanje .srt fajlova
- 🗂️ **Kolekcije** - Organizacija filmova po serijama/kolekcijama
- 🔍 **Pretraga** - Brza pretraga po naslovu i kolekciji
- 📊 **Metadata Parsing** - Automatsko ekstraktovanje godine, kvaliteta, formata
- 🎨 **Moderan UI** - Dark mode dizajn sa Tailwind CSS
- 📱 **Responsive** - Prilagođen za sve uređaje
- ⚡ **Auto-scan** - Automatsko skeniranje novih filmova

## 🏗️ Struktura Projekta

```
eVagaMovies/
├── backend/              # Node.js/Express server
│   ├── server.js        # API endpoints i streaming
│   ├── database.js      # SQLite database operacije
│   ├── scanner.js       # Auto-scan filmova
│   └── package.json
├── frontend/            # React aplikacija
│   ├── src/
│   │   ├── components/  # UI komponente
│   │   ├── pages/       # Stranice
│   │   ├── utils/       # API client
│   │   └── App.jsx
│   └── package.json
├── movies/              # Filmovi folder
│   ├── [Godfather]/     # Kolekcija
│   │   └── The Godfather (1972) [2160p]../
│   └── [RAZNO]/         # Standalone filmovi
└── .github/agents/      # GitHub Copilot agenti
```

## 📁 Struktura Filmova

Filmovi treba da budu organizovani ovako:

```
movies/
  [Godfather]/                                    # Kolekcija (opciono)
    The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX]/
      The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX].mp4
      The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX].srt
    The Godfather Part II (1974) [1080p]../
      ...
  [RAZNO]/                                        # Za standalone filmove
    Inception (2010) [1080p]../
      ...
```

**Pravila:**
- Kolekcije foldera: `[NazivKolekcije]`
- Naziv filma: `Naslov (Godina) [Kvalitet] [Format] [Izvor] [Audio]`
- Video fajlovi: `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`
- Subtitle fajlovi: `.srt`, `.vtt` (isti naziv kao video)

## 🚀 Instalacija

### Preduslovi

- Node.js 18+ (ili instaliraj NVM)
- npm ili yarn

### 1. Kloniraj projekat

```bash
cd /home/lakisha/eVagaMovies
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Konfiguracija

Backend `.env` fajl već postoji:
```env
PORT=3001
MOVIES_PATH=/home/lakisha/eVagaMovies/movies
DB_PATH=/home/lakisha/eVagaMovies/backend/movies.db
```

## 🎯 Pokretanje

### Development Mode

**Backend** (u jednom terminalu):
```bash
cd backend
npm run dev
# Server: http://localhost:3001
```

**Frontend** (u drugom terminalu):
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend Build:**
```bash
cd frontend
npm run build
npm run preview
```

## 🎨 Tehnologije

### Frontend
- **React 19** - UI framework
- **React Router** - Navigacija
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Ikone
- **Framer Motion** - Animacije

### Backend
- **Node.js 24** - Runtime
- **Express** - Web framework
- **better-sqlite3** - Database
- **chokidar** - File watching
- **dotenv** - Environment config
- **cors** - CORS podrška

## 📡 API Endpoints

```
GET  /api/movies           - Svi filmovi
GET  /api/movies/:id       - Jedan film
GET  /api/search?q=query   - Pretraga
GET  /api/collections      - Sve kolekcije
GET  /api/scan             - Skeniraj filmove
GET  /api/stream/:id       - Stream video
GET  /api/subtitle/:id     - Subtitle fajl
GET  /api/health           - Health check
```

## 🎬 Korišćenje

1. **Dodaj filmove** u `/home/lakisha/eVagaMovies/movies` folder
2. **Pokreni servere** (backend i frontend)
3. **Otvori aplikaciju** na `http://localhost:5173`
4. **Klikni "Skeniraj Filmove"** na početnoj strani
5. **Gledaj filmove!** 🍿

## 🔧 Skeniranje Filmova

### Automatski (na startup)
Server automatski skenira filmove pri pokretanju.

### Ručno (iz UI)
Klikni na "Skeniraj Filmove" dugme na početnoj strani.

### Komandna linija
```bash
cd backend
npm run scan
```

## 🎯 GitHub Copilot Agenti

Projekat uključuje specijalizovane GitHub Copilot agente iz vaga-beta-react projekta:

- `react-expert.md` - React development
- `programer.md` - General programming
- `dizajner.md` - UI/UX design

Koristi ih pozivajući `@react-expert` ili `@programer` u GitHub Copilot chatu.

## 🛠️ Razvoj

### Dodavanje novih feature-a

1. Backend API u `backend/server.js`
2. Database schema u `backend/database.js`
3. Frontend komponente u `frontend/src/components`
4. Nove stranice u `frontend/src/pages`

### Linting & Formatting

```bash
cd frontend
npm run lint
```

## 📝 Licenca

Projekat je vlasništvo LakishaDev. Sva prava zadržana.

## 👤 Autor

**LakishaDev**
- GitHub: [@LakishaDev](https://github.com/LakishaDev)
- Email: lazar.cve@gmail.com

## 🙏 Acknowledgments

Dizajn i struktura inspirisani [vaga-beta-react](https://github.com/LakishaDev/vaga-beta-react) projektom.

---

**Sretno gledanje! 🎬🍿**
