import fs from "fs";
import path from "path";
import { addMovie, clearDatabase, getAllMovies } from "./database.js";
import {
  generateThumbnail,
  getThumbnailFilename,
  isFfmpegAvailable,
  checkExistingThumbnail,
} from "./thumbnail-agent.js";

// Auto-generisanje thumbnail-a je po defaultu isključeno; postavi AUTO_GENERATE_THUMBNAILS=true da omogućiš
const AUTO_GENERATE_THUMBNAILS =
  process.env.AUTO_GENERATE_THUMBNAILS === "true";

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
];
const SUBTITLE_EXTENSIONS = [".srt", ".vtt", ".sub", ".ass"];
const THUMBNAIL_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const THUMBNAIL_NAMES = ["naslovna", "poster", "cover", "thumbnail", "thumb"];

function parseMovieName(folderName) {
  // Example: "The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX]"
  const data = {
    title: "",
    year: null,
    quality: null,
    format: null,
    codec: null,
    audio: null,
    source: null,
  };

  // Extract year
  const yearMatch = folderName.match(/\((\d{4})\)/);
  if (yearMatch) {
    data.year = parseInt(yearMatch[1]);
    data.title = folderName.substring(0, yearMatch.index).trim();
  } else {
    data.title = folderName;
  }

  // Extract quality (2160p, 1080p, 720p, etc.)
  const qualityMatch = folderName.match(/\[?(\d{3,4}p)\]?/i);
  if (qualityMatch) {
    data.quality = qualityMatch[1];
  }

  // Extract format (4K, HD, etc.)
  const formatMatch = folderName.match(/\[?(4K|HD|UHD|FHD)\]?/i);
  if (formatMatch) {
    data.format = formatMatch[1];
  }

  // Extract source (WEB, BluRay, DVDRip, etc.)
  const sourceMatch = folderName.match(
    /\[?(WEB|BluRay|BRRip|DVDRip|HDTV|WEB-DL)\]?/i
  );
  if (sourceMatch) {
    data.source = sourceMatch[1];
  }

  // Extract audio (5.1, 7.1, AAC, etc.)
  const audioMatch = folderName.match(/\[?(5\.1|7\.1|AAC|DTS|AC3)\]?/i);
  if (audioMatch) {
    data.audio = audioMatch[1];
  }

  return data;
}

function getCollectionName(folderPath) {
  const parentFolder = path.basename(path.dirname(folderPath));
  // Collection folders are in format [CollectionName]
  const match = parentFolder.match(/^\[(.*)\]$/);
  return match ? match[1] : "RAZNO";
}

function findThumbnail(files) {
  for (const name of THUMBNAIL_NAMES) {
    const thumbnail = files.find((file) => {
      const baseName = path.basename(file, path.extname(file)).toLowerCase();
      const ext = path.extname(file).toLowerCase();
      return baseName === name && THUMBNAIL_EXTENSIONS.includes(ext);
    });
    if (thumbnail) return thumbnail;
  }

  // Fallback: prvi image fajl
  return files.find((file) =>
    THUMBNAIL_EXTENSIONS.includes(path.extname(file).toLowerCase())
  );
}

function isSubcategoryFolder(folderName) {
  // Provera da li je folder subkategorija (u zagradi sa godinama ili samo ime u zagradi)
  return folderName.startsWith("[") && folderName.endsWith("]");
}

function hasVideoFile(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files.some((file) =>
      VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );
  } catch {
    return false;
  }
}

// Agent za rekurzivno skeniranje foldera
async function scanFolderAgent(
  folderPath,
  collectionName,
  subcategoryPath = [],
  moviesPath,
  preservedThumbs = new Map()
) {
  const movies = [];
  const files = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const dirent of files) {
    if (!dirent.isDirectory()) continue;

    const itemPath = path.join(folderPath, dirent.name);

    // Provera da li je ovo podkategorija (folder u [ ])
    if (isSubcategoryFolder(dirent.name)) {
      const subName = dirent.name.slice(1, -1); // Ukloni [ ]
      const indent = "  ".repeat(subcategoryPath.length + 1);
      console.log(`${indent}📁 Subcategory: ${subName}`);

      // Rekurzivno skeniraj podkategoriju
      const newSubPath = [...subcategoryPath, subName];
      const subMovies = await scanFolderAgent(
        itemPath,
        collectionName,
        newSubPath,
        moviesPath,
        preservedThumbs
      );
      movies.push(...subMovies);
      continue;
    }

    // Provera da li folder sadrži video fajlove direktno
    if (hasVideoFile(itemPath)) {
      const movieFolderPath = itemPath;
      const movieFiles = fs.readdirSync(movieFolderPath);

      const videoFiles = movieFiles.filter((file) =>
        VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
      );

      if (videoFiles.length === 0) continue;

      // Ako folder sadrži više filmova, tretiramo ga kao dodatnu podkategoriju
      const subPathForMovies =
        videoFiles.length > 1
          ? [...subcategoryPath, dirent.name]
          : subcategoryPath;

      for (const videoFile of videoFiles) {
        const baseName = path.basename(videoFile, path.extname(videoFile));

        // Prefer subtitle sa istim imenom, inače prvi dostupni
        const subtitleFile =
          movieFiles.find((file) => {
            const ext = path.extname(file).toLowerCase();
            return (
              SUBTITLE_EXTENSIONS.includes(ext) &&
              path.basename(file, ext) === baseName
            );
          }) ||
          movieFiles.find((file) =>
            SUBTITLE_EXTENSIONS.includes(path.extname(file).toLowerCase())
          );

        // Prefer thumbnail sa istim imenom, inače pretraži standardne nazive
        let thumbnailFile = movieFiles.find((file) => {
          const ext = path.extname(file).toLowerCase();
          return (
            THUMBNAIL_EXTENSIONS.includes(ext) &&
            path.basename(file, ext) === baseName
          );
        });

        if (!thumbnailFile) {
          thumbnailFile = findThumbnail(movieFiles);
        }

        const movieData = parseMovieName(baseName);

        const videoFilePath = path.join(movieFolderPath, videoFile);
        const stats = fs.statSync(videoFilePath);

        const relativeVideoPath = path.relative(moviesPath, videoFilePath);
        const relativeSubtitlePath = subtitleFile
          ? path.relative(moviesPath, path.join(movieFolderPath, subtitleFile))
          : null;

        let relativeThumbnailPath = thumbnailFile
          ? path.relative(moviesPath, path.join(movieFolderPath, thumbnailFile))
          : null;

        // 🎬 THUMBNAIL AGENT: Generiši thumbnail ako je dozvoljeno i ne postoji
        if (
          !thumbnailFile &&
          AUTO_GENERATE_THUMBNAILS &&
          (await isFfmpegAvailable())
        ) {
          try {
            const indent = "  ".repeat(subPathForMovies.length + 1);

            const movieHash = Buffer.from(`${collectionName}-${baseName}`)
              .toString("base64")
              .replace(/[\/+=]/g, "")
              .substring(0, 16);
            const thumbnailFilename = getThumbnailFilename(movieHash, false);

            const existingThumbnail = checkExistingThumbnail(thumbnailFilename);

            if (existingThumbnail) {
              relativeThumbnailPath = existingThumbnail;
              console.log(
                `${indent}✅ Using existing thumbnail: ${relativeThumbnailPath}`
              );
            } else {
              console.log(
                `${indent}🎨 No thumbnail found, generating from video...`
              );

              const absoluteVideoPath = path.join(
                moviesPath,
                relativeVideoPath
              );

              const generatedPath = await generateThumbnail(
                absoluteVideoPath,
                thumbnailFilename
              );

              if (generatedPath) {
                relativeThumbnailPath = generatedPath;
                console.log(
                  `${indent}✅ Thumbnail generated: ${relativeThumbnailPath}`
                );
              } else {
                console.log(`${indent}⚠️  Skipped (unsupported video format)`);
              }
            }
          } catch (error) {
            const indent = "  ".repeat(subPathForMovies.length + 1);
            console.error(
              `${indent}❌ Failed to generate thumbnail: ${error.message}`
            );
            relativeThumbnailPath = null;
          }
        } else if (!thumbnailFile) {
          const indent = "  ".repeat(subPathForMovies.length + 1);
          const reason = AUTO_GENERATE_THUMBNAILS
            ? "FFmpeg not available"
            : "Auto thumbnail generation disabled";
          console.log(`${indent}⚠️  No thumbnail found (${reason})`);

          const preserved = preservedThumbs.get(relativeVideoPath);
          if (preserved && preserved.startsWith("generated-thumbnails/")) {
            relativeThumbnailPath = preserved;
            console.log(
              `${indent}✅ Using preserved thumbnail: ${relativeThumbnailPath}`
            );
          }
        }

        const mainSubcategory =
          subPathForMovies.length > 0
            ? subPathForMovies[subPathForMovies.length - 1]
            : null;

        movies.push({
          title: movieData.title,
          year: movieData.year,
          quality: movieData.quality,
          format: movieData.format,
          codec: movieData.codec,
          audio: movieData.audio,
          source: movieData.source,
          collection: collectionName,
          subcategory: mainSubcategory,
          thumbnail_path: relativeThumbnailPath,
          file_path: relativeVideoPath,
          subtitle_path: relativeSubtitlePath,
          file_size: stats.size,
        });

        const indent = "  ".repeat(subPathForMovies.length + 1);
        const subcatInfo =
          subPathForMovies.length > 0
            ? ` [${subPathForMovies.join(" > ")}]`
            : "";
        console.log(
          `${indent}✅ ${movieData.title} (${movieData.year})${subcatInfo}`
        );
      }
    } else {
      // Folder bez video fajla - možda sadrži još dublje foldere
      const subdirs = fs
        .readdirSync(itemPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

      // Ako folder ima više podfoldera, tretiramo ga kao implicitnu kategoriju
      if (subdirs.length > 1) {
        const indent = "  ".repeat(subcategoryPath.length + 1);
        console.log(`${indent}📁 Subcategory: ${dirent.name}`);

        const implicitSubPath = [...subcategoryPath, dirent.name];
        const deepMovies = await scanFolderAgent(
          itemPath,
          collectionName,
          implicitSubPath,
          moviesPath,
          preservedThumbs
        );
        movies.push(...deepMovies);
      } else {
        // Rekurzivno skeniraj ovaj folder bez dodavanja nove kategorije
        const deepMovies = await scanFolderAgent(
          itemPath,
          collectionName,
          subcategoryPath,
          moviesPath,
          preservedThumbs
        );
        movies.push(...deepMovies);
      }
    }
  }

  return movies;
}

export async function scanMoviesFolder(moviesPath) {
  console.log(`🔍 Scanning movies folder: ${moviesPath}`);

  // Preserve existing generated thumbnails by file_path before clearing DB
  const preservedThumbs = new Map();
  try {
    const existing = getAllMovies();
    for (const m of existing) {
      if (
        m.thumbnail_path &&
        m.thumbnail_path.startsWith("generated-thumbnails/") &&
        m.file_path
      ) {
        preservedThumbs.set(m.file_path, m.thumbnail_path);
      }
    }
  } catch (e) {
    console.warn(
      `⚠️  Could not load existing movies for preservation: ${e.message}`
    );
  }

  // Clear existing database
  clearDatabase();

  let movieCount = 0;

  try {
    // Read collection folders (e.g., [Godfather], [MARVEL], [RAZNO])
    const collections = fs
      .readdirSync(moviesPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const collectionDir of collections) {
      const collectionPath = path.join(moviesPath, collectionDir.name);
      // Ako je u formatu [NAME] ukloni zagrade, inače koristi originalno ime
      const bracketMatch = collectionDir.name.match(/^\[(.*)\]$/);
      const collectionName = bracketMatch
        ? bracketMatch[1]
        : collectionDir.name;

      console.log(`📂 Scanning collection: ${collectionName}`);

      // Koristi agenta za skaniranje (prosleđujemo moviesPath)
      const movies = await scanFolderAgent(
        collectionPath,
        collectionName,
        [],
        moviesPath,
        preservedThumbs
      );

      // Dodaj sve filmove u bazu
      for (const movie of movies) {
        addMovie(movie);
        movieCount++;
      }
    }

    console.log(`\n🎉 Scan complete! Found ${movieCount} movies`);
    return { success: true, count: movieCount };
  } catch (error) {
    console.error("❌ Scan failed:", error);
    throw error;
  }
}
