import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import jschardet from 'jschardet';
import { initDatabase, getAllMovies, getMovieById, searchMovies, getCollections, getSubcategories, getMoviesBySubcategory } from './database.js';
import { scanMoviesFolder } from './scanner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const MOVIES_PATH = process.env.MOVIES_PATH || path.join(__dirname, '../movies');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// API Routes
app.get('/api/movies', async (req, res) => {
  try {
    const movies = getAllMovies();
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const movies = searchMovies(q);
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/collections', async (req, res) => {
  try {
    const collections = getCollections();
    res.json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/collections/:collection/subcategories', async (req, res) => {
  try {
    const subcategories = getSubcategories(req.params.collection);
    res.json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/collections/:collection/subcategories/:subcategory/movies', async (req, res) => {
  try {
    const movies = getMoviesBySubcategory(req.params.collection, req.params.subcategory);
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scan', async (req, res) => {
  try {
    const result = await scanMoviesFolder(MOVIES_PATH);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Video streaming endpoint
app.get('/api/stream/:id', (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const videoPath = path.join(MOVIES_PATH, movie.file_path);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ success: false, error: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Subtitle endpoint
app.get('/api/subtitle/:id', (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie || !movie.subtitle_path) {
      return res.status(404).json({ success: false, error: 'Subtitle not found' });
    }

    const subtitlePath = path.join(MOVIES_PATH, movie.subtitle_path);
    
    if (!fs.existsSync(subtitlePath)) {
      return res.status(404).json({ success: false, error: 'Subtitle file not found' });
    }

    // Read file as buffer first
    const buffer = fs.readFileSync(subtitlePath);
    
    // Detect encoding
    const detected = jschardet.detect(buffer);
    let encoding = detected.encoding || 'windows-1250';
    
    // Force windows-1250 for unknown or low confidence detections
    // This is the most common encoding for Serbian/Croatian subtitles
    if (!encoding || 
        encoding.toLowerCase() === 'ascii' || 
        encoding.toLowerCase().includes('unknown') ||
        detected.confidence < 0.7) {
      encoding = 'windows-1250';
    }
    
    console.log(`Subtitle: ${path.basename(subtitlePath)}`);
    console.log(`Detected: ${detected.encoding} (confidence: ${detected.confidence})`);
    console.log(`Using: ${encoding}`);
    
    // Decode to UTF-8
    let content;
    try {
      content = iconv.decode(buffer, encoding);
    } catch (err) {
      // Fallback to windows-1250 if decoding fails
      console.log('Decoding failed, falling back to windows-1250');
      content = iconv.decode(buffer, 'windows-1250');
    }
    
    // SRT to VTT conversion
    if (subtitlePath.endsWith('.srt')) {
      content = 'WEBVTT\n\n' + content
        .replace(/\r\n/g, '\n')
        .replace(/\n\r/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
    } else if (!content.startsWith('WEBVTT')) {
      content = 'WEBVTT\n\n' + content;
    }

    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(content);
  } catch (error) {
    console.error('Subtitle error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Thumbnail endpoint
app.get('/api/thumbnail/:id', (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie || !movie.thumbnail_path) {
      return res.status(404).json({ success: false, error: 'Thumbnail not found' });
    }

    // Proveri da li je thumbnail generisan ili postojeći
    let thumbnailPath;
    if (movie.thumbnail_path.startsWith('generated-thumbnails/')) {
      // Generisani thumbnail - u backend direktorijumu
      thumbnailPath = path.join(__dirname, movie.thumbnail_path);
    } else {
      // Postojeći thumbnail - u movies direktorijumu
      thumbnailPath = path.join(MOVIES_PATH, movie.thumbnail_path);
    }
    
    if (!fs.existsSync(thumbnailPath)) {
      return res.status(404).json({ success: false, error: 'Thumbnail file not found' });
    }

    const ext = path.extname(thumbnailPath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    fs.createReadStream(thumbnailPath).pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, HOST, () => {
  const localIP = '10.0.0.197'; // Tvoj lokalni IP
  console.log(`🎬 eVagaMovies server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log(`📁 Movies folder: ${MOVIES_PATH}`);
  
  // Auto-scan on startup
  scanMoviesFolder(MOVIES_PATH)
    .then(result => console.log(`✅ Initial scan complete: ${result.count} movies found`))
    .catch(err => console.error('❌ Initial scan failed:', err));
});
