#!/usr/bin/env node

/**
 * Thumbnail Generation Debug & Test Agent
 * Testira i debuguje generisanje thumbnail slika
 */

import { generateThumbnail, getThumbnailFilename, isFfmpegAvailable } from './thumbnail-agent.js';
import fs from 'fs';
import path from 'path';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];

async function findFirstMovie() {
  const moviesPath = process.env.MOVIES_PATH || path.join(process.cwd(), '../movies');
  
  console.log(`🔍 Tražim prvi dostupan film u: ${moviesPath}\n`);
  
  const collections = fs.readdirSync(moviesPath, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const collection of collections) {
    const collectionPath = path.join(moviesPath, collection.name);
    const items = fs.readdirSync(collectionPath, { withFileTypes: true })
      .filter(d => d.isDirectory());
    
    for (const item of items) {
      const itemPath = path.join(collectionPath, item.name);
      const files = fs.readdirSync(itemPath);
      
      const videoFile = files.find(f => 
        VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase())
      );
      
      if (videoFile) {
        const videoPath = path.join(itemPath, videoFile);
        return {
          name: item.name,
          collection: collection.name,
          videoPath: videoPath,
          videoFile: videoFile
        };
      }
    }
  }
  
  return null;
}

async function testThumbnailGeneration() {
  console.log('🎬 Thumbnail Generation Test Agent');
  console.log('===================================\n');
  
  // 1. Proveri FFmpeg
  console.log('📋 Step 1: Checking FFmpeg availability...');
  const hasFFmpeg = isFfmpegAvailable();
  
  if (!hasFFmpeg) {
    console.error('❌ FFmpeg not available!');
    console.log('\nPlease install FFmpeg:');
    console.log('  sudo dnf install -y ffmpeg\n');
    return false;
  }
  
  console.log('✅ FFmpeg is available\n');
  
  // 2. Pronađi test film
  console.log('📋 Step 2: Finding test movie...');
  const movie = await findFirstMovie();
  
  if (!movie) {
    console.error('❌ No movies found in /movies directory!');
    return false;
  }
  
  console.log(`✅ Found: ${movie.name}`);
  console.log(`   Collection: ${movie.collection}`);
  console.log(`   Video: ${movie.videoFile}`);
  console.log(`   Path: ${movie.videoPath}\n`);
  
  // 3. Proveri da li video fajl postoji
  console.log('📋 Step 3: Verifying video file...');
  if (!fs.existsSync(movie.videoPath)) {
    console.error(`❌ Video file not found: ${movie.videoPath}`);
    return false;
  }
  
  const stats = fs.statSync(movie.videoPath);
  console.log(`✅ Video file exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`);
  
  // 4. Generiši thumbnail
  console.log('📋 Step 4: Generating thumbnail...');
  try {
    const movieHash = Buffer.from(movie.name).toString('base64')
      .replace(/[/+=]/g, '').substring(0, 16);
    const filename = getThumbnailFilename(movieHash);
    
    console.log(`   Filename: ${filename}.jpg`);
    console.log(`   Processing...\n`);
    
    const thumbnailPath = await generateThumbnail(movie.videoPath, filename);
    
    console.log(`✅ Thumbnail generated successfully!`);
    console.log(`   Path: ${thumbnailPath}\n`);
    
    // 5. Verifikuj da thumbnail postoji
    console.log('📋 Step 5: Verifying generated thumbnail...');
    const fullPath = path.join(process.cwd(), thumbnailPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Thumbnail file not found: ${fullPath}`);
      return false;
    }
    
    const thumbStats = fs.statSync(fullPath);
    console.log(`✅ Thumbnail verified (${(thumbStats.size / 1024).toFixed(2)} KB)\n`);
    
    console.log('🎉 All tests passed! Thumbnail generation is working!\n');
    return true;
    
  } catch (error) {
    console.error(`❌ Thumbnail generation failed!`);
    console.error(`   Error: ${error.message}`);
    console.error(`\n   Stack trace:`);
    console.error(error.stack);
    return false;
  }
}

async function diagnoseThumbnailIssues() {
  console.log('\n🔬 Running diagnostics...\n');
  
  // Check generated-thumbnails directory
  const thumbDir = path.join(process.cwd(), 'generated-thumbnails');
  console.log(`📁 Thumbnails directory: ${thumbDir}`);
  
  if (!fs.existsSync(thumbDir)) {
    console.log('   ⚠️  Directory does not exist - will be created on first generation');
  } else {
    console.log('   ✅ Directory exists');
    const files = fs.readdirSync(thumbDir);
    console.log(`   📊 Existing thumbnails: ${files.length}`);
    
    if (files.length > 0) {
      console.log('\n   Recent thumbnails:');
      files.slice(0, 5).forEach(f => {
        const stats = fs.statSync(path.join(thumbDir, f));
        console.log(`     - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    }
  }
  
  // Check permissions
  try {
    const testFile = path.join(thumbDir, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('   ✅ Write permissions OK\n');
  } catch (error) {
    console.log('   ❌ Write permissions FAILED');
    console.log(`      Error: ${error.message}\n`);
  }
}

// Main
(async () => {
  try {
    await diagnoseThumbnailIssues();
    const success = await testThumbnailGeneration();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
})();
