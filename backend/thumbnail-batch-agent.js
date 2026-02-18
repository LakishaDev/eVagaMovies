/**
 * 🎬 Thumbnail Batch Agent
 *
 * Omogućava batch operacije na thumbnail-ima:
 * - Regenerisanje thumbnail-a za sve filmove bez thumbnail-a
 * - Pregled svih thumbnail-a
 * - Uklanjanje/zamjena thumbnail-a
 *
 * Koristi se iz backend API-ja ili direktno u Node-u
 */

import database from "./database.js";
import { generateThumbnail, getThumbnailFilename } from "./thumbnail-agent.js";
import path from "path";
import fs from "fs";
import { THUMBNAILS_DIR } from "./config.js";
import { MOVIES_PATH } from "./config.js";

/**
 * 🔧 Pronađi sve filmove bez thumbnail-a
 * @returns {Array} - Niz filmova bez thumbnail-a
 */
export function getMoviesWithoutThumbnail() {
  const stmt = db.prepare(`
    SELECT id, title, file_path FROM movies 
    WHERE thumbnail_path IS NULL OR thumbnail_path = ''
    ORDER BY title ASC
  `);
  return stmt.all();
}

/**
 * 🔧 Regeneriši thumbnail-e za sve filmove bez thumbnail-a
 * @param {Function} onProgress - Callback funkcija za progress (optional)
 * @returns {Promise<Object>} - Statistika regenerisanja
 */
export async function regenerateAllThumbnails(onProgress = null) {
  const moviesWithoutThumbnail = getMoviesWithoutThumbnail();

  const stats = {
    total: moviesWithoutThumbnail.length,
    generated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`\n🎬 Batch Thumbnail Regeneration`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Total movies without thumbnail: ${stats.total}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  for (let i = 0; i < moviesWithoutThumbnail.length; i++) {
    const movie = moviesWithoutThumbnail[i];
    const progress = ((i + 1) / stats.total) * 100;

    try {
      // Progress callback
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: stats.total,
          percentage: progress,
          movie: movie.title,
        });
      }

      const videoPath = path.join(MOVIES_PATH || ".", movie.file_path);

      if (!fs.existsSync(videoPath)) {
        console.warn(
          `⚠️  [${i + 1}/${stats.total}] Video not found: ${movie.title}`
        );
        stats.skipped++;
        continue;
      }

      const filename = getThumbnailFilename(movie.id);
      const thumbnailPath = await generateThumbnail(videoPath, filename);

      if (thumbnailPath) {
        // Update database
        db.prepare("UPDATE movies SET thumbnail_path = ? WHERE id = ?").run(
          thumbnailPath,
          movie.id
        );
        console.log(`✅ [${i + 1}/${stats.total}] Generated: ${movie.title}`);
        stats.generated++;
      } else {
        console.warn(
          `⚠️  [${i + 1}/${stats.total}] Skipped (incompatible): ${movie.title}`
        );
        stats.skipped++;
      }
    } catch (error) {
      console.error(
        `❌ [${i + 1}/${stats.total}] Error: ${movie.title} - ${error.message}`
      );
      stats.failed++;
      stats.errors.push({
        movieId: movie.id,
        title: movie.title,
        error: error.message,
      });
    }
  }

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 BATCH REGENERATION SUMMARY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Generated: ${stats.generated}/${stats.total}`);
  console.log(`⚠️  Skipped: ${stats.skipped}/${stats.total}`);
  console.log(`❌ Failed: ${stats.failed}/${stats.total}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (stats.errors.length > 0) {
    console.log(`❌ ERRORS:`);
    stats.errors.forEach((err) => {
      console.log(`   • ${err.title}: ${err.error}`);
    });
  }

  return stats;
}

/**
 * 🔧 Pronađi sve filmove sa thumbnail-a
 * @returns {Array} - Niz filmova sa thumbnail-ima
 */
export function getMoviesWithThumbnail() {
  const stmt = database.prepare(`
    SELECT id, title, thumbnail_path FROM movies 
    WHERE thumbnail_path IS NOT NULL AND thumbnail_path != ''
    ORDER BY title ASC
  `);
  return stmt.all();
}

/**
 * 🔧 Ukupna statistika thumbnail-a
 * @returns {Object} - Statistika
 */
export function getThumbnailStats() {
  const withThumbnail = database
    .prepare(
      `
    SELECT COUNT(*) as count FROM movies 
    WHERE thumbnail_path IS NOT NULL AND thumbnail_path != ''
  `
    )
    .get();

  const withoutThumbnail = database
    .prepare(
      `
    SELECT COUNT(*) as count FROM movies 
    WHERE thumbnail_path IS NULL OR thumbnail_path = ''
  `
    )
    .get();

  const generatedThumbnails = database
    .prepare(
      `
    SELECT COUNT(*) as count FROM movies 
    WHERE thumbnail_path LIKE 'generated-thumbnails/%'
  `
    )
    .get();

  return {
    totalMovies: database.prepare("SELECT COUNT(*) as count FROM movies").get()
      .count,
    withThumbnail: withThumbnail.count,
    withoutThumbnail: withoutThumbnail.count,
    generatedThumbnails: generatedThumbnails.count,
    existingThumbnails: withThumbnail.count - generatedThumbnails.count,
  };
}

/**
 * 🔧 Regeneriši thumbnail za specifičan film
 * @param {number} movieId - ID filma
 * @returns {Promise<Object>} - Rezultat regenerisanja
 */
export async function regenerateSingleThumbnail(movieId) {
  try {
    const movie = database
      .prepare("SELECT * FROM movies WHERE id = ?")
      .get(movieId);

    if (!movie) {
      throw new Error(`Movie with id ${movieId} not found`);
    }

    const videoPath = path.join(MOVIES_PATH || ".", movie.file_path);

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const filename = getThumbnailFilename(movie.id);
    const thumbnailPath = await generateThumbnail(videoPath, filename);

    if (!thumbnailPath) {
      throw new Error("Incompatible video format or codec");
    }

    // Update database
    database
      .prepare("UPDATE movies SET thumbnail_path = ? WHERE id = ?")
      .run(thumbnailPath, movie.id);

    return {
      success: true,
      movieId: movie.id,
      title: movie.title,
      thumbnail: thumbnailPath,
      message: "Thumbnail successfully regenerated",
    };
  } catch (error) {
    return {
      success: false,
      movieId: movieId,
      error: error.message,
    };
  }
}

/**
 * 🔧 Obriši thumbnail za specifičan film (može se regenerisati kasnije)
 * @param {number} movieId - ID filma
 * @returns {Object} - Rezultat brisanja
 */
export function deleteThumbnail(movieId) {
  try {
    const movie = database
      .prepare("SELECT thumbnail_path FROM movies WHERE id = ?")
      .get(movieId);

    if (!movie) {
      throw new Error(`Movie with id ${movieId} not found`);
    }

    if (movie.thumbnail_path?.startsWith("generated-thumbnails/")) {
      const filePath = path.join(
        process.cwd(),
        "backend",
        movie.thumbnail_path
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    database
      .prepare("UPDATE movies SET thumbnail_path = NULL WHERE id = ?")
      .run(movieId);

    return {
      success: true,
      movieId: movieId,
      message: "Thumbnail deleted",
    };
  } catch (error) {
    return {
      success: false,
      movieId: movieId,
      error: error.message,
    };
  }
}
