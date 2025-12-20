# 🎯 eVagaMovies - Feature Overview

## ✨ Implementirane Funkcionalnosti

### 🎬 Backend (Node.js/Express)

#### 1. **Video Streaming**
- HTTP range requests support
- Partial content (206) responses
- Adaptivni streaming za velike fajlove
- Support za .mp4, .mkv, .avi, .mov, .wmv

#### 2. **SQLite Database**
- Automatsko kreiranje database schema
- Indeksi za brže pretrge
- Metadata storage (title, year, quality, format, etc.)
- Play count i last played tracking

#### 3. **Folder Scanner**
- Automatsko parsiranje folder strukture
- Regex parsing za movie metadata
- Detekcija kolekcija ([FolderName])
- Support za subtitle fajlove
- File size tracking

#### 4. **REST API**
```javascript
GET  /api/movies           // Svi filmovi
GET  /api/movies/:id       // Single movie
GET  /api/search?q=query   // Search
GET  /api/collections      // Sve kolekcije
GET  /api/scan             // Trigger scan
GET  /api/stream/:id       // Video stream
GET  /api/subtitle/:id     // Subtitle file
GET  /api/health           // Health check
```

#### 5. **Auto-Scan**
- Skeniranje pri pokretanju servera
- Manual trigger iz UI
- Console logging progress

---

### 🎨 Frontend (React 19)

#### 1. **Stranice**

**HomePage** (`/`)
- Grid prikaz svih filmova
- "Skeniraj Filmove" dugme
- Empty state za praznu listu
- Loading state

**CollectionsPage** (`/collections`)
- Filter po kolekcijama
- Counter za broj filmova
- Tab navigation
- Dinamički učitavanje

**SearchPage** (`/search`)
- Search input sa ikonama
- Real-time pretraga
- Results counter
- Empty state

**MoviePlayer** (`/movie/:id`)
- Full-featured video player
- Native HTML5 controls
- Subtitle support (.srt)
- Metadata display
- Back navigation

#### 2. **Komponente**

**Layout**
- Sticky navigation bar
- Responsive header
- Footer
- Gradijent background

**MovieCard**
- Poster placeholder
- Quality badge
- Year, format, audio display
- Collection tag
- File size
- Hover effects
- Link na player

#### 3. **Routing**
- React Router DOM v7
- Nested routes
- Back navigation
- Clean URLs

#### 4. **Styling**
- Tailwind CSS custom theme
- Dark mode default
- Custom scrollbar
- Responsive grid layouts
- Hover animations
- Lucide React ikone

#### 5. **API Integration**
- Centralizovan API client
- Async/await pattern
- Error handling
- Base URL konfiguracija

---

## 🎯 Key Features

### ✅ Što Radi

1. **Automatsko Skeniranje**
   - Čita folder strukturu
   - Parsira metadata iz imena
   - Kreira database entries
   - Povezuje video i subtitle fajlove

2. **Video Streaming**
   - Range request support
   - Nema buffer delay
   - Seek support
   - Adaptive bandwidth

3. **Subtitle Podrška**
   - Auto-load subtitles
   - Toggle on/off
   - Native browser support
   - .srt format

4. **Organizacija**
   - Kolekcije/serijali
   - Standalone filmovi
   - Search funkcionalnost
   - Filter po kolekciji

5. **Responsive UI**
   - Mobile-friendly
   - Tablet optimized
   - Desktop full experience
   - Dark theme

6. **Performance**
   - SQLite indexing
   - Lazy loading
   - Optimized queries
   - Fast search

---

## 🔮 Moguća Proširenja (TODO)

### Backend
- [ ] Watch history tracking
- [ ] Recently played filmovi
- [ ] Favorite/bookmark system
- [ ] Multi-user support
- [ ] Authentication
- [ ] File upload API
- [ ] Thumbnail generation
- [ ] Video transcoding
- [ ] Watchlist
- [ ] Ratings system

### Frontend
- [ ] Dark/Light mode toggle
- [ ] Custom video player UI
- [ ] Keyboard shortcuts
- [ ] Continue watching
- [ ] Watch progress bar
- [ ] Advanced filters (year, quality, format)
- [ ] Sort options (newest, title, year)
- [ ] Grid/List view toggle
- [ ] Infinite scroll
- [ ] Movie details modal
- [ ] Trailer support
- [ ] Cast & crew info
- [ ] IMDb integration

### Database
- [ ] PostgreSQL migration
- [ ] Full-text search
- [ ] Watch statistics
- [ ] User preferences
- [ ] Playlists

### DevOps
- [ ] Docker support
- [ ] Nginx reverse proxy
- [ ] SSL/HTTPS
- [ ] Systemd service
- [ ] Auto-backup database
- [ ] Logging system
- [ ] Monitoring

---

## 🏗️ Arhitektura

```
┌─────────────────────────────────────────────┐
│           Browser (React App)                │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Pages  │  │Components│  │ API Client │ │
│  └────┬────┘  └────┬─────┘  └─────┬──────┘ │
│       │            │               │         │
│       └────────────┴───────────────┘         │
└───────────────────┬─────────────────────────┘
                    │ HTTP/REST
┌───────────────────┴─────────────────────────┐
│         Express Server (Backend)             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ REST API │  │ Scanner  │  │  SQLite   │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │             │               │        │
│       └─────────────┴───────────────┘        │
└───────────────────┬─────────────────────────┘
                    │ File System
┌───────────────────┴─────────────────────────┐
│          Movies Folder Structure             │
│                                              │
│  [Collection]/                               │
│    Movie (Year) [Quality]/                   │
│      movie.mp4                               │
│      movie.srt                               │
└──────────────────────────────────────────────┘
```

---

## 📊 Tech Stack Summary

| Layer      | Technology           | Version |
|------------|---------------------|---------|
| Frontend   | React               | 19.1    |
| Build      | Vite                | Latest  |
| Routing    | React Router DOM    | 7.x     |
| Styling    | Tailwind CSS        | 4.x     |
| Icons      | Lucide React        | Latest  |
| Animation  | Framer Motion       | Latest  |
| Backend    | Node.js             | 24.12   |
| Framework  | Express             | 4.21    |
| Database   | better-sqlite3      | 11.8    |
| File Watch | chokidar            | 4.0     |
| Dev Tools  | nodemon             | 3.1     |

---

## 🎓 Learning Resources

Ako želiš da proučiš projekat:

1. **Backend Flow:**
   - `server.js` → Main entry point
   - `database.js` → SQL operations
   - `scanner.js` → Folder scanning logic

2. **Frontend Flow:**
   - `main.jsx` → Entry point
   - `App.jsx` → Router setup
   - `pages/` → Page components
   - `components/` → Reusable UI

3. **Data Flow:**
   - Movies folder → Scanner → SQLite → API → React → UI

---

**Projekat je spreman za korišćenje! 🎉**

Dodaj filmove u `movies` folder i uživaj! 🍿
