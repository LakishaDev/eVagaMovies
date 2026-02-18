import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "movies.db");
const db = new Database(DB_PATH);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER,
      quality TEXT,
      format TEXT,
      codec TEXT,
      audio TEXT,
      source TEXT,
      collection TEXT,
      subcategory TEXT,
      thumbnail_path TEXT,
      file_path TEXT NOT NULL,
      subtitle_path TEXT,
      file_size INTEGER,
      duration INTEGER,
      added_date TEXT DEFAULT CURRENT_TIMESTAMP,
      last_played TEXT,
      play_count INTEGER DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      movie_count INTEGER DEFAULT 0
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_title ON movies(title);
    CREATE INDEX IF NOT EXISTS idx_collection ON movies(collection);
    CREATE INDEX IF NOT EXISTS idx_year ON movies(year);
  `);

  console.log("✅ Database initialized");
}

export function addMovie(movieData) {
  const stmt = db.prepare(`
    INSERT INTO movies (title, year, quality, format, codec, audio, source, collection, subcategory, thumbnail_path, file_path, subtitle_path, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    movieData.title,
    movieData.year,
    movieData.quality,
    movieData.format,
    movieData.codec,
    movieData.audio,
    movieData.source,
    movieData.collection,
    movieData.subcategory,
    movieData.thumbnail_path,
    movieData.file_path,
    movieData.subtitle_path,
    movieData.file_size
  );

  return result.lastInsertRowid;
}

export function getAllMovies() {
  const stmt = db.prepare("SELECT * FROM movies ORDER BY title ASC");
  return stmt.all();
}

export function getMovieById(id) {
  const stmt = db.prepare("SELECT * FROM movies WHERE id = ?");
  return stmt.get(id);
}

export function searchMovies(query) {
  const stmt = db.prepare(`
    SELECT * FROM movies 
    WHERE title LIKE ? OR collection LIKE ?
    ORDER BY title ASC
  `);
  return stmt.all(`%${query}%`, `%${query}%`);
}

export function getCollections() {
  const stmt = db.prepare(`
    SELECT collection, COUNT(*) as count 
    FROM movies 
    GROUP BY collection 
    ORDER BY collection ASC
  `);
  return stmt.all();
}

export function getSubcategories(collection) {
  const stmt = db.prepare(`
    SELECT DISTINCT subcategory, COUNT(*) as count
    FROM movies 
    WHERE collection = ? AND subcategory IS NOT NULL
    GROUP BY subcategory
    ORDER BY subcategory ASC
  `);
  return stmt.all(collection);
}

export function getMoviesBySubcategory(collection, subcategory) {
  const stmt = db.prepare(`
    SELECT * FROM movies 
    WHERE collection = ? AND subcategory = ?
    ORDER BY title ASC
  `);
  return stmt.all(collection, subcategory);
}

export function updatePlayCount(id) {
  const stmt = db.prepare(`
    UPDATE movies 
    SET play_count = play_count + 1, last_played = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  return stmt.run(id);
}

// 🎬 NOVA FUNKCIONALNOST: Ažuriranje thumbnail-a
// Omogućava ažuriranje thumbnail putanje za film (kada korisnik bira novi frame)
export function updateMovieThumbnail(id, thumbnailPath) {
  const stmt = db.prepare(`
    UPDATE movies 
    SET thumbnail_path = ?
    WHERE id = ?
  `);
  const result = stmt.run(thumbnailPath, id);

  if (result.changes === 0) {
    throw new Error(`Movie with id ${id} not found`);
  }

  return result;
}

// 🎬 NOVA FUNKCIONALNOST: Batch update thumbnail-a
// Ažurira više thumbnail-a odjednom (npr. za sve filmove bez thumbnail-a)
export function batchUpdateThumbnails(updates) {
  // updates je niz objekta sa {id: ..., thumbnail_path: ...}
  const stmt = db.prepare("UPDATE movies SET thumbnail_path = ? WHERE id = ?");
  const transaction = db.transaction(() => {
    for (const update of updates) {
      stmt.run(update.thumbnail_path, update.id);
    }
  });

  return transaction();
}

export function clearDatabase() {
  db.exec("DELETE FROM movies");
  db.exec("DELETE FROM collections");
  console.log("✅ Database cleared");
}

export default db;
