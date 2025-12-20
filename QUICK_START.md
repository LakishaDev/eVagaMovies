# 🎬 eVagaMovies - Kompletan Vodič

## 📦 Šta je Instalirano

✅ **Backend** (Node.js/Express server)
✅ **Frontend** (React + Vite aplikacija)
✅ **SQLite Database** (za metadata)
✅ **Tailwind CSS** (modern styling)
✅ **React Router** (navigacija)
✅ **Lucide Icons** (ikone)

## 🚀 KAKO POKRENUTI PROJEKAT

### Metoda 1: Automatska (Preporučeno)

```bash
cd /home/lakisha/eVagaMovies
./start.sh
```

### Metoda 2: Ručna

**Otvori 2 terminala:**

**Terminal 1 - Backend:**
```bash
cd /home/lakisha/eVagaMovies/backend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/lakisha/eVagaMovies/frontend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

## 🌐 Pristup Aplikaciji

Nakon pokretanja:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## 📁 Dodavanje Filmova

### 1. Struktura Foldera

Dodaj filmove u `/home/lakisha/eVagaMovies/movies` folder:

```
movies/
  [ImeKolekcije]/                    <- Za serijale/kolekcije
    Naziv Filma (Godina) [Kvalitet]../
      film.mp4
      film.srt
  [RAZNO]/                           <- Za samostalne filmove
    Film (2020) [1080p]../
      film.mkv
      film.srt
```

### 2. Primeri

**Kolekcija (npr. Godfather trilogy):**
```
[Godfather]/
  The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX]/
    The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX].mp4
    The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX].srt
  The Godfather Part II (1974) [1080p] [BluRay]../
    ...
```

**Samostalni Film:**
```
[RAZNO]/
  Inception (2010) [1080p] [WEB-DL]/
    Inception (2010) [1080p] [WEB-DL].mkv
    Inception (2010) [1080p] [WEB-DL].srt
```

### 3. Podržani Formati

**Video:** `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`
**Subtitle:** `.srt`, `.vtt`, `.sub`, `.ass`

## 🔍 Korišćenje Aplikacije

### 1. Početna Stranica
- Prikazuje sve filmove
- Klikni **"Skeniraj Filmove"** da učitaš nove filmove

### 2. Kolekcije
- Filtriraj filmove po kolekcijama
- Vidi broj filmova u svakoj kolekciji

### 3. Pretraga
- Pretraži po naslovu ili kolekciji
- Real-time rezultati

### 4. Player
- Klikni na film da ga reprodukuješ
- Built-in subtitle support
- Fullscreen mode
- Play/Pause, Mute, Volume kontrole

## ⚙️ Konfiguracija

### Backend .env (već konfigurisano)
```env
PORT=3001
MOVIES_PATH=/home/lakisha/eVagaMovies/movies
DB_PATH=/home/lakisha/eVagaMovies/backend/movies.db
```

### Promena Porta

**Backend (.env):**
```env
PORT=8080  # Promeni na željeni port
```

**Frontend (src/utils/api.js):**
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🛠️ Komande

### Backend
```bash
cd backend
npm run dev      # Development mode sa auto-reload
npm start        # Production mode
npm run scan     # Ručno skeniranje filmova
```

### Frontend
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Code linting
```

## 🔥 Često Postavljana Pitanja

### Q: Kako dodajem nove filmove?
A: Dodaj ih u `movies` folder i klikni "Skeniraj Filmove" u aplikaciji.

### Q: Šta ako film nema subtitle?
A: Normalno će raditi, samo subtitle neće biti dostupan.

### Q: Mogu li pristupiti sa druge mašine na mreži?
A: Da! Promeni `localhost` u `<IP_ADRESA_SERVERA>` u frontend api.js fajlu.

### Q: Kako resetujem database?
A: Obriši `backend/movies.db` fajl i pokreni "Skeniraj Filmove".

### Q: Player ne radi?
A: Proveri da li je video fajl validan format i da backend server radi.

## 📊 API Endpoints (za development)

```
GET  /api/movies           - Lista svih filmova
GET  /api/movies/:id       - Jedan film po ID
GET  /api/search?q=query   - Pretraga filmova
GET  /api/collections      - Lista kolekcija
GET  /api/scan             - Skeniraj movies folder
GET  /api/stream/:id       - Stream video fajl
GET  /api/subtitle/:id     - Subtitle fajl
GET  /api/health           - Server health check
```

## 🎨 Customizacija

### Boje (Tailwind Config)
Fajl: `frontend/tailwind.config.js`

```javascript
colors: {
  primary: '#1E3E49',    // Tamno plava
  secondary: '#6EAEA2',  // Mint zelena
  accent: '#AD5637',     // Crveno-braon
  dark: '#1A343D',       // Tamna
  light: '#CBCFBB',      // Svetla
}
```

## 📝 Troubleshooting

### Backend ne startuje
```bash
# Proveri port
lsof -i :3001

# Proveri Node.js
node --version

# Reinstall dependencies
cd backend && rm -rf node_modules package-lock.json && npm install
```

### Frontend greška
```bash
# Clear cache i reinstall
cd frontend
rm -rf node_modules package-lock.json .vite
npm install
```

### Video ne učitava
- Proveri da je backend server pokrenut
- Proveri konzolu browsera (F12) za greške
- Proveri da video fajl postoji u movies folderu

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm start  # Port 3001
```

### Frontend (statički)
```bash
cd frontend
npm run build
# Servaj dist/ folder sa Nginx ili Apache
```

## 📞 Podrška

Ako imaš problema:
1. Proveri konzolu (F12 u browseru)
2. Proveri backend terminal za greške
3. Restartuj servere
4. Kontaktiraj developera

---

**Autor:** LakishaDev  
**GitHub:** [@LakishaDev](https://github.com/LakishaDev)

**Uživaj u gledanju filmova! 🎬🍿**
