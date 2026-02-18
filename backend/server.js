import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import iconv from "iconv-lite";
import jschardet from "jschardet";
import {
  initDatabase,
  getAllMovies,
  getMovieById,
  searchMovies,
  getCollections,
  getSubcategories,
  getMoviesBySubcategory,
  updateMovieThumbnail,
} from "./database.js";
import { scanMoviesFolder } from "./scanner.js";
import {
  captureFrameAtTime,
  getVideoInfo,
  getThumbnailFilename,
} from "./thumbnail-agent.js";
import {
  regenerateAllThumbnails,
  getMoviesWithoutThumbnail,
  getThumbnailStats,
  regenerateSingleThumbnail,
  deleteThumbnail,
} from "./thumbnail-batch-agent.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const MOVIES_PATH =
  process.env.MOVIES_PATH || path.join(__dirname, "../movies");
// Auto-scan disabled by default; set AUTO_SCAN_ON_START=true to enable
const AUTO_SCAN_ON_START = process.env.AUTO_SCAN_ON_START === "true";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Initialize database
initDatabase();

// API Routes
app.get("/api/movies", async (req, res) => {
  try {
    const movies = getAllMovies();
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    const movies = searchMovies(q);
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/collections", async (req, res) => {
  try {
    const collections = getCollections();
    res.json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/collections/:collection/subcategories", async (req, res) => {
  try {
    const subcategories = getSubcategories(req.params.collection);
    res.json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get(
  "/api/collections/:collection/subcategories/:subcategory/movies",
  async (req, res) => {
    try {
      const movies = getMoviesBySubcategory(
        req.params.collection,
        req.params.subcategory
      );
      res.json({ success: true, data: movies });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

app.get("/api/scan", async (req, res) => {
  try {
    const result = await scanMoviesFolder(MOVIES_PATH);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Video streaming endpoint
app.get("/api/stream/:id", (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    const videoPath = path.join(MOVIES_PATH, movie.file_path);

    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({ success: false, error: "Video file not found" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Subtitle endpoint
app.get("/api/subtitle/:id", (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie || !movie.subtitle_path) {
      return res
        .status(404)
        .json({ success: false, error: "Subtitle not found" });
    }

    const subtitlePath = path.join(MOVIES_PATH, movie.subtitle_path);

    if (!fs.existsSync(subtitlePath)) {
      return res
        .status(404)
        .json({ success: false, error: "Subtitle file not found" });
    }

    // Read file as buffer first
    const buffer = fs.readFileSync(subtitlePath);

    // Detect encoding
    const detected = jschardet.detect(buffer);
    let encoding = detected.encoding || "windows-1250";

    // Force windows-1250 for unknown or low confidence detections
    // This is the most common encoding for Serbian/Croatian subtitles
    if (
      !encoding ||
      encoding.toLowerCase() === "ascii" ||
      encoding.toLowerCase().includes("unknown") ||
      detected.confidence < 0.7
    ) {
      encoding = "windows-1250";
    }

    console.log(`Subtitle: ${path.basename(subtitlePath)}`);
    console.log(
      `Detected: ${detected.encoding} (confidence: ${detected.confidence})`
    );
    console.log(`Using: ${encoding}`);

    // Decode to UTF-8
    let content;
    try {
      content = iconv.decode(buffer, encoding);
    } catch (err) {
      // Fallback to windows-1250 if decoding fails
      console.log("Decoding failed, falling back to windows-1250");
      content = iconv.decode(buffer, "windows-1250");
    }

    // SRT to VTT conversion
    if (subtitlePath.endsWith(".srt")) {
      content =
        "WEBVTT\n\n" +
        content
          .replace(/\r\n/g, "\n")
          .replace(/\n\r/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, "$1:$2:$3.$4");
    } else if (!content.startsWith("WEBVTT")) {
      content = "WEBVTT\n\n" + content;
    }

    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(content);
  } catch (error) {
    console.error("Subtitle error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Thumbnail endpoint
app.get("/api/thumbnail/:id", (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie || !movie.thumbnail_path) {
      return res
        .status(404)
        .json({ success: false, error: "Thumbnail not found" });
    }

    // Proveri da li je thumbnail generisan ili postojeći
    let thumbnailPath;
    if (movie.thumbnail_path.startsWith("generated-thumbnails/")) {
      // Generisani thumbnail - u backend direktorijumu
      thumbnailPath = path.join(__dirname, movie.thumbnail_path);
    } else {
      // Postojeći thumbnail - u movies direktorijumu
      thumbnailPath = path.join(MOVIES_PATH, movie.thumbnail_path);
    }

    if (!fs.existsSync(thumbnailPath)) {
      return res
        .status(404)
        .json({ success: false, error: "Thumbnail file not found" });
    }

    const ext = path.extname(thumbnailPath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    res.setHeader("Content-Type", mimeTypes[ext] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache 24h
    fs.createReadStream(thumbnailPath).pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// 🎬 NOVA FUNKCIONALNOST: Video Info Endpoint
// Dobija informacije o videu (trajanje, rezolucija, itd.)
app.get("/api/video-info/:id", async (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    const videoPath = path.join(MOVIES_PATH, movie.file_path);
    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({ success: false, error: "Video file not found" });
    }

    const videoInfo = await getVideoInfo(videoPath);
    res.json({ success: true, data: videoInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 NOVA FUNKCIONALNOST: Capture Frame Endpoint
// Pravi thumbnail od specifičnog frame-a u videu
app.post("/api/movies/:id/capture-thumbnail", async (req, res) => {
  try {
    const { timestamp } = req.body;

    if (timestamp === undefined || timestamp === null) {
      return res
        .status(400)
        .json({ success: false, error: "Timestamp is required" });
    }

    if (typeof timestamp !== "number" || timestamp < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid timestamp (must be positive number)",
      });
    }

    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    const videoPath = path.join(MOVIES_PATH, movie.file_path);
    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({ success: false, error: "Video file not found" });
    }

    // Generiši unique filename za novi thumbnail
    const filename = getThumbnailFilename(
      `${req.params.id}-custom-${Date.now()}`
    );

    // Capture frame na zadatom vremenu
    const newThumbnailPath = await captureFrameAtTime(
      videoPath,
      timestamp,
      filename
    );

    // Update movie u bazi sa novim thumbnail-om
    updateMovieThumbnail(req.params.id, newThumbnailPath);

    console.log(
      `✅ Thumbnail updated for movie ${req.params.id}: ${newThumbnailPath}`
    );

    res.json({
      success: true,
      data: {
        thumbnail_path: newThumbnailPath,
        timestamp: timestamp,
        message: "Thumbnail successfully captured and updated",
      },
    });
  } catch (error) {
    console.error("Capture thumbnail error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 BATCH OPERATIONS: Thumbnail Statistics
app.get("/api/thumbnail-stats", (req, res) => {
  try {
    const stats = getThumbnailStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 BATCH OPERATIONS: Pronađi sve filmove bez thumbnail-a
app.get("/api/movies-without-thumbnail", (req, res) => {
  try {
    const movies = getMoviesWithoutThumbnail();
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 BATCH OPERATIONS: Regeneriši sve thumbnail-e
// ⚠️  PAŽNJA: Ova operacija može trajati dugo (do nekoliko minuta)
app.post("/api/regenerate-all-thumbnails", async (req, res) => {
  try {
    console.log("📸 Starting batch thumbnail regeneration...");
    res.json({
      success: true,
      message: "Batch regeneration started in background",
    });

    // Pokreni u background-u
    regenerateAllThumbnails((progress) => {
      console.log(
        `[${progress.current}/${progress.total}] ${
          progress.movie
        } (${progress.percentage.toFixed(1)}%)`
      );
    })
      .then((stats) => {
        console.log("✅ Batch regeneration complete:", stats);
      })
      .catch((err) => {
        console.error("❌ Batch regeneration error:", err);
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 BATCH OPERATIONS: Regeneriši thumbnail za jedan film
app.post("/api/movies/:id/regenerate-thumbnail", async (req, res) => {
  try {
    const result = await regenerateSingleThumbnail(req.params.id);
    if (result.success) {
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎬 BATCH OPERATIONS: Obriši thumbnail za film
app.delete("/api/movies/:id/thumbnail", (req, res) => {
  try {
    const result = deleteThumbnail(req.params.id);
    if (result.success) {
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  const localIP = process.env.HOST; // Tvoj lokalni IP
  console.log(`🎬 eVagaMovies server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log(`📁 Movies folder: ${MOVIES_PATH}`);

  // Optional auto-scan on startup (controlled by AUTO_SCAN_ON_START)
  if (AUTO_SCAN_ON_START) {
    scanMoviesFolder(MOVIES_PATH)
      .then((result) =>
        console.log(`✅ Initial scan complete: ${result.count} movies found`)
      )
      .catch((err) => console.error("❌ Initial scan failed:", err));
  } else {
    console.log(
      "⏸️  Auto-scan on startup is disabled (AUTO_SCAN_ON_START=false)"
    );
  }
});
