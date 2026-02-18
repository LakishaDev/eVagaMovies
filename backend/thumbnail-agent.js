import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Agent za generisanje thumbnail slika iz video fajlova
 * Koristi ffmpeg za extractovanje frame-a na random poziciji u videu
 */

// Putanja do direktorijuma za generisane thumbnail-e
const THUMBNAILS_DIR = path.join(process.cwd(), "generated-thumbnails");

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
      await execPromise("ffmpeg -version");
      ffmpegAvailable = true;
      console.log("✅ FFmpeg detected and available");
      return true;
    } catch (error) {
      ffmpegAvailable = false;
      console.warn(
        "⚠️  FFmpeg not found. Thumbnail generation will be disabled."
      );
      console.warn(
        "   Install ffmpeg to enable automatic thumbnail generation from videos."
      );
      return false;
    }
  })();

  return ffmpegCheckPromise;
}

// Proveri dostupnost pri učitavanju modula (ali čekaj)
checkFfmpegAvailability();

// Optional external thumbnailer availability
async function isThumbnailerAvailable() {
  try {
    await execPromise("ffmpegthumbnailer -v");
    return true;
  } catch {
    return false;
  }
}

async function generateWithThumbnailer(videoPath, outputFilename, timestamp) {
  const thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.jpg`);
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor(timestamp % 60);
  const ts = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
  const cmd = `ffmpegthumbnailer -i "${videoPath}" -o "${thumbnailPath}" -s 1280 -t ${ts}`;
  await execPromise(cmd);
  return `generated-thumbnails/${outputFilename}.jpg`;
}

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
    throw new Error(
      "FFmpeg is not available. Please install ffmpeg to generate thumbnails."
    );
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
    const randomTime = Math.floor(
      minTime + Math.random() * (maxTime - minTime)
    );

    console.log(
      `📸 Generating thumbnail for ${path.basename(
        videoPath
      )} at ${randomTime}s...`
    );

    // Generiši thumbnail path
    // Try JPG first, then PNG as fallback
    const outputExts = ["jpg", "png"];
    let thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.jpg`);

    // Očisti stari fajl ako je ostao iz prethodnog pokušaja
    if (fs.existsSync(thumbnailPath)) {
      try {
        fs.unlinkSync(thumbnailPath);
      } catch (err) {
        console.warn(`⚠️  Could not remove old thumbnail: ${err.message}`);
      }
    }

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
          size: "1280x720", // HD kvalitet
        })
        .on("end", () => {
          console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
          resolve(`generated-thumbnails/${outputFilename}.jpg`);
        })
        .on("error", (err) => {
          // Tiho preskači problematične fajlove (kodeci, formati, itd.)
          const errorMsg = err.message || "";

          // Poznate greške koje treba preskočiti
          const skipErrors = [
            "filtergraph inputs/outputs",
            "Invalid argument",
            "Conversion failed",
            "codec not currently supported",
            "No such filter",
            "Error opening filters",
          ];

          const shouldSkip = skipErrors.some((msg) => errorMsg.includes(msg));

          if (shouldSkip) {
            console.warn(
              `⚠️  Skipping (incompatible format/codec): ${path.basename(
                videoPath
              )}`
            );
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

/**
 * 🎬 NOVA FUNKCIJA: Capture frame na specificiranom vremenu
 * Omogućava korisniku da bira točku u videu i pravi thumbnail od tog frame-a
 * @param {string} videoPath - Apsolutna putanja do video fajla
 * @param {number} timestamp - Vrijeme u sekundama gdje se nalazi željeni frame
 * @param {string} outputFilename - Ime output fajla
 * @returns {Promise<string>} - Relativna putanja do generisanog thumbnail-a
 */
export async function captureFrameAtTime(videoPath, timestamp, outputFilename) {
  const hasFFmpeg = await isFfmpegAvailable();
  if (!hasFFmpeg) {
    throw new Error(
      "FFmpeg is not available. Please install ffmpeg to capture frames."
    );
  }

  try {
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Proverimo da li je timestamp validan
    const duration = await getVideoDuration(videoPath);
    if (timestamp < 0 || timestamp > duration) {
      throw new Error(
        `Invalid timestamp: ${timestamp}. Video duration is ${duration}s.`
      );
    }

    // Konvertuj timestamp u HH:MM:SS format
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor(timestamp % 60);
    const timeFormat = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    console.log(
      `📸 Capturing frame from ${path.basename(
        videoPath
      )} at ${timeFormat} (${timestamp}s)...`
    );

    // Try JPG first, then PNG
    const outputExts = ["jpg", "png"];
    let thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.jpg`);

    // Koristimo explicitni -ss i jedan frame kako bismo izbegli FFmpeg filtergraph greške
    const timeArg = Number.isInteger(timestamp)
      ? `${timestamp}`
      : timestamp.toFixed(3);

    const strategies = [
      {
        name: "pre-seek-scale",
        configure: (cmd) =>
          cmd
            .inputOptions([
              `-ss ${timeArg}`,
              "-probesize 50M",
              "-analyzeduration 200M",
            ])
            .outputOptions([
              "-frames:v 1",
              "-vf scale=1280:-1",
              "-y",
              "-q:v 2",
              "-f image2",
              "-map 0:v:0",
            ]),
      },
      {
        name: "pre-seek-raw",
        configure: (cmd) =>
          cmd
            .inputOptions([
              `-ss ${timeArg}`,
              "-probesize 50M",
              "-analyzeduration 200M",
            ])
            .outputOptions([
              "-frames:v 1",
              "-y",
              "-q:v 2",
              "-f image2",
              "-map 0:v:0",
            ]),
      },
      {
        name: "input-seek-raw",
        configure: (cmd) =>
          cmd
            .seekInput(timeArg)
            .inputOptions(["-probesize 50M", "-analyzeduration 200M"])
            .outputOptions([
              "-frames:v 1",
              "-y",
              "-q:v 2",
              "-f image2",
              "-map 0:v:0",
            ]),
      },
    ];

    const errors = [];

    for (const strategy of strategies) {
      for (const ext of outputExts) {
        try {
          thumbnailPath = path.join(THUMBNAILS_DIR, `${outputFilename}.${ext}`);
          if (fs.existsSync(thumbnailPath)) {
            try {
              fs.unlinkSync(thumbnailPath);
            } catch {}
          }

          await new Promise((resolve, reject) => {
            strategy
              .configure(ffmpeg(videoPath))
              .format("image2")
              .output(thumbnailPath)
              .on("end", () => resolve())
              .on("error", (err) => reject(err))
              .run();
          });

          console.log(
            `✅ Frame captured and saved (${strategy.name}, ${ext}): ${thumbnailPath}`
          );
          return `generated-thumbnails/${outputFilename}.${ext}`;
        } catch (err) {
          errors.push(`${strategy.name}.${ext}: ${err.message}`);
        }
      }
    }

    // Try external thumbnailer if available
    if (await isThumbnailerAvailable()) {
      try {
        const rel = await generateWithThumbnailer(
          videoPath,
          outputFilename,
          Number(timeArg)
        );
        console.log(
          `✅ Frame captured via ffmpegthumbnailer: ${thumbnailPath}`
        );
        return rel;
      } catch (tnErr) {
        errors.push(`ffmpegthumbnailer: ${tnErr.message}`);
      }
    } else {
      errors.push("ffmpegthumbnailer: not installed");
    }

    // Fallback: transcode a tiny 2s AVC clip and grab from it (handles HEVC/10-bit incompat)
    const tempFile = path.join(
      tmpdir(),
      `evaga-thumb-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`
    );

    try {
      const transcode = async (codec) => {
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .inputOptions([
              `-ss ${timeArg}`,
              "-probesize 50M",
              "-analyzeduration 200M",
            ])
            .outputOptions([
              "-t 2",
              "-an",
              "-sn",
              "-dn",
              `-c:v ${codec}`,
              "-pix_fmt yuv420p",
              "-preset ultrafast",
              "-movflags +faststart",
              "-y",
              "-map 0:v:0",
            ])
            .output(tempFile)
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
            .run();
        });
      };

      try {
        await transcode("libx264");
      } catch (e1) {
        errors.push(`fallback-transcode-libx264: ${e1.message}`);
        await transcode("mpeg4");
      }

      await new Promise((resolve, reject) => {
        ffmpeg(tempFile)
          .inputOptions(["-ss 0"])
          .outputOptions([
            "-frames:v 1",
            "-vf scale=1280:-1",
            "-q:v 2",
            "-y",
            "-map 0:v:0",
          ])
          .format("image2")
          .output(thumbnailPath)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });

      console.log(`✅ Frame captured via transcode fallback: ${thumbnailPath}`);
      return `generated-thumbnails/${outputFilename}.jpg`;
    } catch (fallbackErr) {
      errors.push(`fallback-transcode: ${fallbackErr.message}`);
    } finally {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (cleanupErr) {
          console.warn(`⚠️  Could not remove temp file: ${cleanupErr.message}`);
        }
      }
    }

    const friendlyMessage =
      "Frame capture failed for this file/codec. Try a different timestamp or transcode the video (e.g. to H.264/AVC).";
    console.warn(`⚠️  ${friendlyMessage}`);
    console.warn(`↩️  Attempts: ${errors.join(" | ")}`);
    throw new Error(friendlyMessage);
  } catch (error) {
    console.error(`❌ Frame capture failed: ${error.message}`);
    throw error;
  }
}

/**
 * 🎬 NOVA FUNKCIJA: Dobij video informacije (trajanje, kodeke, itd.)
 * Koristi se za prikazivanje informacija u UI-u
 * @param {string} videoPath - Apsolutna putanja do video fajla
 * @returns {Promise<object>} - Informacije o videu
 */
export async function getVideoInfo(videoPath) {
  try {
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const format = metadata.format;
          const videoStream =
            metadata.streams.find((s) => s.codec_type === "video") || {};

          resolve({
            filename: path.basename(videoPath),
            duration: Math.floor(format.duration || 0),
            bitrate: format.bit_rate || 0,
            size: format.size || 0,
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            codec: videoStream.codec_name || "unknown",
            fps: videoStream.r_frame_rate || "unknown",
          });
        }
      });
    });
  } catch (error) {
    console.error(`❌ Video info retrieval failed: ${error.message}`);
    throw error;
  }
}
