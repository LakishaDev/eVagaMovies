import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Agent za generisanje thumbnail slika iz video fajlova
 * Koristi ffmpeg za extractovanje frame-a na random poziciji u videu
 */

// Putanja do direktorijuma za generisane thumbnail-e
const THUMBNAILS_DIR = path.join(process.cwd(), 'generated-thumbnails');

// Kreiraj direktorijum ako ne postoji
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// Provera da li je ffmpeg dostupan
let ffmpegAvailable = null; // null = nije još provereno
let ffmpegCheckPromise = null;

async function checkFfmpegAvailability() {
  if (ffmpegCheckPromise) {
    return ffmpegCheckPromise;
  }
  
  ffmpegCheckPromise = (async () => {
    try {
      await execPromise('ffmpeg -version');
      ffmpegAvailable = true;
      console.log('✅ FFmpeg detected and available');
      return true;
    } catch (error) {
      ffmpegAvailable = false;
      console.warn('⚠️  FFmpeg not found. Thumbnail generation will be disabled.');
      console.warn('   Install ffmpeg to enable automatic thumbnail generation from videos.');
      return false;
    }
  })();
  
  return ffmpegCheckPromise;
}

// Proveri dostupnost pri učitavanju modula (ali čekaj)
checkFfmpegAvailability();

/**
 * Dohvata trajanje videa u sekundama
 * @param {string} videoPath - Putanja do video fajla
 * @returns {Promise<number>} - Trajanje videa u sekundama
 */
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration);
      }
    });
  });
}

/**
 * Generiše thumbnail iz videa na random poziciji
 * @param {string} videoPath - Apsolutna putanja do video fajla
 * @param {string} outputFilename - Ime output fajla (bez ekstenzije)
 * @returns {Promise<string>} - Relativna putanja do generisanog thumbnail-a
 */
export async function generateThumbnail(videoPath, outputFilename) {
  // Proveri da li je ffmpeg dostupan
  const hasFFmpeg = await isFfmpegAvailable();
  if (!hasFFmpeg) {
    throw new Error('FFmpeg is not available. Please install ffmpeg to generate thumbnails.');
  }

  try {
    // Proveri da li video fajl postoji
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Dohvati trajanje videa
    const duration = await getVideoDuration(videoPath);
    
    // Izračunaj random timestamp između 10% i 40% trajanja videa
    // Izbegavamo početak (credits) i kraj (credits)
    const minTime = duration * 0.1; // 10% od početka
    const maxTime = duration * 0.4; // 40% od početka
    const randomTime = Math.floor(minTime + Math.random() * (maxTime - minTime));
    
    console.log(`📸 Generating thumbnail for ${path.basename(videoPath)} at ${randomTime}s...`);

    // Generiši thumbnail path
    const thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.jpg`);
    
    // Proveri da li thumbnail već postoji
    if (fs.existsSync(thumbnailPath)) {
      console.log(`✅ Thumbnail already exists, skipping generation`);
      return `generated-thumbnails/${outputFilename}.jpg`;
    }

    // Generiši thumbnail koristeći ffmpeg
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [randomTime],
          filename: `${outputFilename}.jpg`,
          folder: THUMBNAILS_DIR,
          size: '1280x720' // HD kvalitet
        })
        .on('end', () => {
          console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
          resolve(`generated-thumbnails/${outputFilename}.jpg`);
        })
        .on('error', (err) => {
          // Tiho preskači problematične fajlove (kodeci, formati, itd.)
          const errorMsg = err.message || '';
          
          // Poznate greške koje treba preskočiti
          const skipErrors = [
            'filtergraph inputs/outputs',
            'Invalid argument',
            'Conversion failed',
            'codec not currently supported',
            'No such filter',
            'Error opening filters'
          ];
          
          const shouldSkip = skipErrors.some(msg => errorMsg.includes(msg));
          
          if (shouldSkip) {
            console.warn(`⚠️  Skipping (incompatible format/codec): ${path.basename(videoPath)}`);
            // Vrati null umesto da reject-uje
            resolve(null);
          } else {
            console.error(`❌ Error generating thumbnail: ${err.message}`);
            reject(err);
          }
        });
    });
  } catch (error) {
    console.error(`❌ Thumbnail generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup funkcija - briše stare generisane thumbnail-e
 * @param {number} daysOld - Briše fajlove starije od X dana
 */
export function cleanupOldThumbnails(daysOld = 30) {
  try {
    const files = fs.readdirSync(THUMBNAILS_DIR);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000; // dani u milisekundama
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(THUMBNAILS_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old thumbnails`);
    }
  } catch (error) {
    console.error(`❌ Cleanup failed: ${error.message}`);
  }
}

/**
 * Proverava da li thumbnail već postoji za dati filename
 * @param {string} outputFilename - Ime fajla (bez ekstenzije)
 * @returns {string|null} - Path do thumbnail-a ili null ako ne postoji
 */
export function checkExistingThumbnail(outputFilename) {
  const thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.jpg`);
  if (fs.existsSync(thumbnailPath)) {
    return `generated-thumbnails/${outputFilename}.jpg`;
  }
  return null;
}

/**
 * Generiše unique filename za thumbnail baziran na movie ID
 * @param {string} movieId - ID filma (hash)
 * @param {boolean} useTimestamp - Da li dodati timestamp (default: false)
 * @returns {string} - Unique filename
 */
export function getThumbnailFilename(movieId, useTimestamp = false) {
  if (useTimestamp) {
    return `movie-${movieId}-${Date.now()}`;
  }
  return `movie-${movieId}`;
}

/**
 * Proverava da li je FFmpeg dostupan
 * @returns {Promise<boolean>} - True ako je ffmpeg dostupan
 */
export async function isFfmpegAvailable() {
  if (ffmpegAvailable === null) {
    await checkFfmpegAvailability();
  }
  return ffmpegAvailable;
}
