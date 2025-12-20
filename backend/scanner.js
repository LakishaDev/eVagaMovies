import fs from 'fs';
import path from 'path';
import { addMovie, clearDatabase } from './database.js';
import { generateThumbnail, getThumbnailFilename, isFfmpegAvailable, checkExistingThumbnail } from './thumbnail-agent.js';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
const SUBTITLE_EXTENSIONS = ['.srt', '.vtt', '.sub', '.ass'];
const THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const THUMBNAIL_NAMES = ['naslovna', 'poster', 'cover', 'thumbnail', 'thumb'];

function parseMovieName(folderName) {
  // Example: "The Godfather (1972) [2160p] [4K] [WEB] [5.1] [YTS.MX]"
  const data = {
    title: '',
    year: null,
    quality: null,
    format: null,
    codec: null,
    audio: null,
    source: null
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
  const sourceMatch = folderName.match(/\[?(WEB|BluRay|BRRip|DVDRip|HDTV|WEB-DL)\]?/i);
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
  return match ? match[1] : 'RAZNO';
}

function findThumbnail(files) {
  for (const name of THUMBNAIL_NAMES) {
    const thumbnail = files.find(file => {
      const baseName = path.basename(file, path.extname(file)).toLowerCase();
      const ext = path.extname(file).toLowerCase();
      return baseName === name && THUMBNAIL_EXTENSIONS.includes(ext);
    });
    if (thumbnail) return thumbnail;
  }
  
  // Fallback: prvi image fajl
  return files.find(file => 
    THUMBNAIL_EXTENSIONS.includes(path.extname(file).toLowerCase())
  );
}

function isSubcategoryFolder(folderName) {
  // Provera da li je folder subkategorija (u zagradi sa godinama ili samo ime u zagradi)
  return folderName.startsWith('[') && folderName.endsWith(']');
}

function hasVideoFile(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files.some(file => 
      VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );
  } catch {
    return false;
  }
}

// Agent za rekurzivno skeniranje foldera
async function scanFolderAgent(folderPath, collectionName, subcategoryPath = [], moviesPath) {
  const movies = [];
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const dirent of files) {
    if (!dirent.isDirectory()) continue;
    
    const itemPath = path.join(folderPath, dirent.name);
    
    // Provera da li je ovo podkategorija (folder u [ ])
    if (isSubcategoryFolder(dirent.name)) {
      const subName = dirent.name.slice(1, -1); // Ukloni [ ]
      const indent = '  '.repeat(subcategoryPath.length + 1);
      console.log(`${indent}📁 Subcategory: ${subName}`);
      
      // Rekurzivno skeniraj podkategoriju
      const newSubPath = [...subcategoryPath, subName];
      const subMovies = await scanFolderAgent(itemPath, collectionName, newSubPath, moviesPath);
      movies.push(...subMovies);
      continue;
    }
    
    // Provera da li folder sadrži video fajl direktno
    if (hasVideoFile(itemPath)) {
      // Ovo je folder sa filmom
      const movieFolderPath = itemPath;
      const movieFiles = fs.readdirSync(movieFolderPath);
      
      // Pronađi video fajl
      const videoFile = movieFiles.find(file => 
        VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
      );
      
      if (!videoFile) continue;
    
      // Pronađi subtitle
      const subtitleFile = movieFiles.find(file => 
        SUBTITLE_EXTENSIONS.includes(path.extname(file).toLowerCase())
      );
      
      // Pronađi thumbnail
      let thumbnailFile = findThumbnail(movieFiles);
      
      // Parse movie data
      const movieData = parseMovieName(dirent.name);
      
      // File size
      const videoFilePath = path.join(movieFolderPath, videoFile);
      const stats = fs.statSync(videoFilePath);
      
      // Kreiranje relativnih putanja sa svim podkategorijama
      let relativeBase = `[${collectionName}]`;
      
      // Dodaj sve podkategorije u putanju
      for (const subcat of subcategoryPath) {
        relativeBase = path.join(relativeBase, `[${subcat}]`);
      }
      relativeBase = path.join(relativeBase, dirent.name);
      
      const relativeVideoPath = path.join(relativeBase, videoFile);
      const relativeSubtitlePath = subtitleFile 
        ? path.join(relativeBase, subtitleFile)
        : null;
      
      let relativeThumbnailPath = thumbnailFile
        ? path.join(relativeBase, thumbnailFile)
        : null;
      
      // 🎬 THUMBNAIL AGENT: Generiši thumbnail ako ne postoji
      if (!thumbnailFile && await isFfmpegAvailable()) {
        try {
          const indent = '  '.repeat(subcategoryPath.length + 1);
          
          // Generiši konzistentan hash (bez timestamp-a)
          const movieHash = Buffer.from(`${collectionName}-${dirent.name}`).toString('base64')
            .replace(/[/+=]/g, '').substring(0, 16);
          const thumbnailFilename = getThumbnailFilename(movieHash, false); // BEZ timestamp-a
          
          // Prvo proveri da li već postoji generisan thumbnail
          const existingThumbnail = checkExistingThumbnail(thumbnailFilename);
          
          if (existingThumbnail) {
            // Thumbnail već postoji, koristi ga
            relativeThumbnailPath = existingThumbnail;
            console.log(`${indent}✅ Using existing thumbnail: ${relativeThumbnailPath}`);
          } else {
            // Thumbnail ne postoji, generiši ga
            console.log(`${indent}🎨 No thumbnail found, generating from video...`);
            
            // Apsolutna putanja do video fajla
            const absoluteVideoPath = path.join(moviesPath, relativeVideoPath);
            
            // Generiši thumbnail
            const generatedPath = await generateThumbnail(absoluteVideoPath, thumbnailFilename);
            
            if (generatedPath) {
              relativeThumbnailPath = generatedPath;
              console.log(`${indent}✅ Thumbnail generated: ${relativeThumbnailPath}`);
            } else {
              console.log(`${indent}⚠️  Skipped (unsupported video format)`);
            }
          }
        } catch (error) {
          const indent = '  '.repeat(subcategoryPath.length + 1);
          console.error(`${indent}❌ Failed to generate thumbnail: ${error.message}`);
          relativeThumbnailPath = null;
        }
      } else if (!thumbnailFile && !await isFfmpegAvailable()) {
        const indent = '  '.repeat(subcategoryPath.length + 1);
        console.log(`${indent}⚠️  No thumbnail found (FFmpeg not available)`);
      }
      
      // Uzmi poslednju podkategoriju kao glavnu (ili null ako nema)
      const mainSubcategory = subcategoryPath.length > 0 
        ? subcategoryPath[subcategoryPath.length - 1] 
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
        file_size: stats.size
      });
      
      const indent = '  '.repeat(subcategoryPath.length + 1);
      const subcatInfo = subcategoryPath.length > 0 ? ` [${subcategoryPath.join(' > ')}]` : '';
      console.log(`${indent}✅ ${movieData.title} (${movieData.year})${subcatInfo}`);
    } else {
      // Folder bez video fajla - možda sadrži još dublje foldere
      // Rekurzivno skeniraj ovaj folder
      const deepMovies = await scanFolderAgent(itemPath, collectionName, subcategoryPath, moviesPath);
      movies.push(...deepMovies);
    }
  }
  
  return movies;
}

export async function scanMoviesFolder(moviesPath) {
  console.log(`🔍 Scanning movies folder: ${moviesPath}`);
  
  // Clear existing database
  clearDatabase();

  let movieCount = 0;

  try {
    // Read collection folders (e.g., [Godfather], [MARVEL], [RAZNO])
    const collections = fs.readdirSync(moviesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('[') && dirent.name.endsWith(']'));

    for (const collectionDir of collections) {
      const collectionPath = path.join(moviesPath, collectionDir.name);
      const collectionName = collectionDir.name.slice(1, -1); // Remove [ ]

      console.log(`📂 Scanning collection: ${collectionName}`);

      // Koristi agenta za skaniranje (prosleđujemo moviesPath)
      const movies = await scanFolderAgent(collectionPath, collectionName, [], moviesPath);
      
      // Dodaj sve filmove u bazu
      for (const movie of movies) {
        addMovie(movie);
        movieCount++;
      }
    }

    console.log(`\n🎉 Scan complete! Found ${movieCount} movies`);
    return { success: true, count: movieCount };
    
  } catch (error) {
    console.error('❌ Scan failed:', error);
    throw error;
  }
}
