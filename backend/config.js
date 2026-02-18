/**
 * 🎬 Backend Configuration
 * Centralizovane konfiguracije za eVagaMovies backend
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 3001;
export const HOST = process.env.HOST || "0.0.0.0";
export const MOVIES_PATH =
  process.env.MOVIES_PATH || path.join(__dirname, "../movies");
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, "movies.db");
export const THUMBNAILS_DIR = path.join(__dirname, "generated-thumbnails");

// Server info
export const SERVER_INFO = {
  localIP: "10.0.0.197", // Za lokalni pristup
  port: PORT,
  host: HOST,
};

// Thumbnail settings
export const THUMBNAIL_SETTINGS = {
  width: 1280,
  height: 720,
  quality: 85,
  format: "jpg",
};

// Video settings
export const VIDEO_SETTINGS = {
  streamChunkSize: 64 * 1024, // 64KB chunks
  maxStreamConnections: 10,
};
