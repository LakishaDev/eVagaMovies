#!/usr/bin/env node

/**
 * 🤖 Thumbnail Auto-Generation Agent
 * 
 * Ovaj agent:
 * 1. Skenira filmove bez thumbnail-a
 * 2. Automatski generiše thumbnail-e u pozadini
 * 3. Prikazuje progress i statistiku
 */

import 'dotenv/config';
import { generateThumbnail, getThumbnailFilename, isFfmpegAvailable } from './thumbnail-agent.js';
import { getAllMovies } from './database.js';
import fs from 'fs';
import path from 'path';

const MOVIES_PATH = process.env.MOVIES_PATH || path.join(process.cwd(), '../movies');
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];

async function findMoviesWithoutThumbnails() {
  console.log('🔍 Skeniram bazu filmova...\n');
  
  const movies = await getAllMovies();
  console.log(`   Ukupno filmova u bazi: ${movies.length}`);
  
  const moviesWithoutThumbs = [];
  let noThumbnailCount = 0;
  let noVideoPathCount = 0;
  let videoNotFoundCount = 0;
  
  for (const movie of movies) {
    // Proveri da li nema thumbnail (prazan ili null)
    const hasNoThumbnail = !movie.thumbnail_path || movie.thumbnail_path.trim() === '';
    
    if (hasNoThumbnail) {
      noThumbnailCount++;
      
      // Video path je 'file_path' u bazi
      const videoPath = movie.file_path;
      
      if (!videoPath) {
        noVideoPathCount++;
        continue;
      }
      
      // Proveri da li video fajl postoji
      const fullVideoPath = path.join(MOVIES_PATH, videoPath);
      if (fs.existsSync(fullVideoPath)) {
        moviesWithoutThumbs.push(movie);
      } else {
        videoNotFoundCount++;
      }
    }
  }
  
  console.log(`   Bez thumbnail-a: ${noThumbnailCount}`);
  console.log(`   Bez file_path: ${noVideoPathCount}`);
  console.log(`   Video ne postoji: ${videoNotFoundCount}`);
  console.log(``);
  
  return moviesWithoutThumbs;
}

async function generateMissingThumbnails(limit = null) {
  console.log('🎬 Thumbnail Auto-Generation Agent');
  console.log('===================================\n');
  
  // Proveri FFmpeg
  const hasFFmpeg = await isFfmpegAvailable();
  if (!hasFFmpeg) {
    console.error('❌ FFmpeg nije dostupan!');
    console.log('\nInstaliraj FFmpeg:');
    console.log('  sudo dnf install -y ffmpeg\n');
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  console.log('✅ FFmpeg dostupan\n');
  
  // Pronađi filmove bez thumbnail-a
  const movies = await findMoviesWithoutThumbnails();
  
  if (movies.length === 0) {
    console.log('✅ Svi filmovi već imaju thumbnail-e!\n');
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  console.log(`📊 Pronađeno ${movies.length} filmova bez thumbnail-a\n`);
  
  const toProcess = limit ? movies.slice(0, limit) : movies;
  const stats = { success: 0, failed: 0, skipped: 0 };
  
  console.log(`🎯 Generišem thumbnail-e za ${toProcess.length} filmova...\n`);
  console.log('─'.repeat(60));
  
  for (let i = 0; i < toProcess.length; i++) {
    const movie = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    
    console.log(`\n${progress} ${movie.title} (${movie.year || 'N/A'})`);
    console.log(`   Video: ${path.basename(movie.file_path || 'unknown')}`);
    
    try {
      const videoPath = movie.file_path;
      
      if (!videoPath) {
        console.log(`   ⏭️  Preskačem: Nema file_path`);
        stats.skipped++;
        continue;
      }
      
      // Generiši hash za filename (BEZ timestamp-a za konzistentnost)
      const movieHash = Buffer.from(`${movie.id}-${movie.title}`).toString('base64')
        .replace(/[/+=]/g, '').substring(0, 16);
      const filename = getThumbnailFilename(movieHash, false); // BEZ timestamp-a
      
      console.log(`   🎨 Generišem thumbnail...`);
      
      const fullVideoPath = path.join(MOVIES_PATH, videoPath);
      const thumbnailPath = await generateThumbnail(fullVideoPath, filename);
      
      if (thumbnailPath) {
        console.log(`   ✅ Uspešno: ${thumbnailPath}`);
        stats.success++;
      } else {
        // generateThumbnail vratio null (preskočen format/codec)
        console.log(`   ⏭️  Preskočeno: Nepodržan format/codec`);
        stats.skipped++;
      }
      
    } catch (error) {
      console.log(`   ❌ Greška: ${error.message}`);
      stats.failed++;
    }
    
    // Pauza između generisanja (smanji opterećenje)
    if (i < toProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Statistika:');
  console.log(`   ✅ Uspešno:  ${stats.success}`);
  console.log(`   ❌ Neuspešno: ${stats.failed}`);
  console.log(`   ⏭️  Preskočeno: ${stats.skipped}`);
  console.log('');
  
  if (stats.success > 0) {
    console.log('🎉 Thumbnail-i uspešno generisani!');
    console.log('   Restartuj server da bi video promene:\n');
    console.log('   ./restart-server.sh\n');
  }
  
  return stats;
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

(async () => {
  try {
    if (command === '--help' || command === '-h') {
      console.log('🎬 Thumbnail Auto-Generation Agent\n');
      console.log('Usage:');
      console.log('  node thumbnail-auto-gen.js [options]\n');
      console.log('Options:');
      console.log('  --all           Generiši sve thumbnail-e');
      console.log('  --limit <N>     Generiši prvih N thumbnail-a');
      console.log('  --check         Samo proveri koliko filmova nema thumbnail');
      console.log('  --help, -h      Prikaži ovu pomoć\n');
      console.log('Examples:');
      console.log('  node thumbnail-auto-gen.js --all');
      console.log('  node thumbnail-auto-gen.js --limit 10');
      console.log('  node thumbnail-auto-gen.js --check\n');
      process.exit(0);
    }
    
    if (command === '--check') {
      const movies = await findMoviesWithoutThumbnails();
      console.log(`📊 ${movies.length} filmova bez thumbnail-a\n`);
      
      if (movies.length > 0) {
        console.log('Primeri:');
        movies.slice(0, 5).forEach(m => {
          console.log(`  - ${m.title} (${m.year || 'N/A'})`);
        });
        
        if (movies.length > 5) {
          console.log(`  ... i još ${movies.length - 5}\n`);
        }
      }
      
      process.exit(0);
    }
    
    let limit = null;
    
    if (command === '--limit') {
      limit = parseInt(args[1]);
      if (isNaN(limit) || limit <= 0) {
        console.error('❌ Invalid limit value');
        process.exit(1);
      }
    } else if (command !== '--all' && command !== undefined) {
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run with --help for usage\n');
      process.exit(1);
    }
    
    const stats = await generateMissingThumbnails(limit);
    process.exit(stats.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
})();
