/**
 * 🎬 Test Suite za Custom Thumbnail Capture Feature
 *
 * Testira:
 * - captureFrameAtTime() iz thumbnail-agent.js
 * - updateMovieThumbnail() iz database.js
 * - Batch operations iz thumbnail-batch-agent.js
 */

import {
  captureFrameAtTime,
  getVideoInfo,
  getThumbnailFilename,
} from "./thumbnail-agent.js";
import { updateMovieThumbnail, getMovieById } from "./database.js";
import {
  regenerateSingleThumbnail,
  getThumbnailStats,
  getMoviesWithoutThumbnail,
} from "./thumbnail-batch-agent.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testVideoPath = path.join(__dirname, "../movies/test-video.mp4");
const movieId = 1; // Replace sa realnim ID-om

console.log("🎬 Testing Custom Thumbnail Capture Feature");
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);

// Test 1: Get Video Info
console.log("TEST 1: Get Video Information");
console.log("─────────────────────────────────────────────────────────────");
try {
  const videoInfo = await getVideoInfo(testVideoPath);
  console.log("✅ Video info retrieved:");
  console.log(`   Duration: ${videoInfo.duration}s`);
  console.log(`   Resolution: ${videoInfo.width}x${videoInfo.height}`);
  console.log(`   Codec: ${videoInfo.codec}`);
  console.log(`   FPS: ${videoInfo.fps}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

// Test 2: Capture Frame at Specific Time
console.log("TEST 2: Capture Frame at Specific Time");
console.log("─────────────────────────────────────────────────────────────");
try {
  const filename = getThumbnailFilename(`${movieId}-test-${Date.now()}`);
  const thumbnailPath = await captureFrameAtTime(testVideoPath, 30, filename);
  console.log(`✅ Frame captured at 30s:`);
  console.log(`   Thumbnail: ${thumbnailPath}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

// Test 3: Update Thumbnail in Database
console.log("TEST 3: Update Thumbnail in Database");
console.log("─────────────────────────────────────────────────────────────");
try {
  const newThumbnailPath = `generated-thumbnails/movie-${movieId}-test.jpg`;
  updateMovieThumbnail(movieId, newThumbnailPath);

  const movie = getMovieById(movieId);
  console.log(`✅ Thumbnail updated:`);
  console.log(`   Movie: ${movie.title}`);
  console.log(`   New thumbnail: ${movie.thumbnail_path}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

// Test 4: Thumbnail Statistics
console.log("TEST 4: Thumbnail Statistics");
console.log("─────────────────────────────────────────────────────────────");
try {
  const stats = getThumbnailStats();
  console.log("✅ Statistics retrieved:");
  console.log(`   Total movies: ${stats.totalMovies}`);
  console.log(`   With thumbnail: ${stats.withThumbnail}`);
  console.log(`   Without thumbnail: ${stats.withoutThumbnail}`);
  console.log(`   Generated thumbnails: ${stats.generatedThumbnails}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

// Test 5: Movies Without Thumbnail
console.log("TEST 5: Find Movies Without Thumbnail");
console.log("─────────────────────────────────────────────────────────────");
try {
  const moviesWithoutThumbnail = getMoviesWithoutThumbnail();
  console.log(
    `✅ Found ${moviesWithoutThumbnail.length} movies without thumbnail:`
  );
  moviesWithoutThumbnail.slice(0, 3).forEach((movie) => {
    console.log(`   - ${movie.title} (ID: ${movie.id})`);
  });
  if (moviesWithoutThumbnail.length > 3) {
    console.log(`   ... and ${moviesWithoutThumbnail.length - 3} more`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

// Test 6: Regenerate Single Thumbnail
console.log("TEST 6: Regenerate Single Thumbnail");
console.log("─────────────────────────────────────────────────────────────");
try {
  const result = await regenerateSingleThumbnail(movieId);
  if (result.success) {
    console.log(`✅ Thumbnail regenerated:`);
    console.log(`   Movie: ${result.title}`);
    console.log(`   Thumbnail: ${result.thumbnail}`);
  } else {
    console.log(`⚠️  Failed: ${result.error}`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
console.log();

console.log("═══════════════════════════════════════════════════════════════");
console.log("✅ Test suite complete!");
console.log("═══════════════════════════════════════════════════════════════");
