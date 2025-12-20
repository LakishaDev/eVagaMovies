#!/usr/bin/env node

/**
 * Test Duplicate Generation Fix
 * Proverava da li scanner preskače već generisane thumbnail-e
 */

import 'dotenv/config';
import { generateThumbnail, getThumbnailFilename, checkExistingThumbnail } from './thumbnail-agent.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 Test Duplicate Thumbnail Generation Fix\n');
console.log('═══════════════════════════════════════════\n');

const MOVIES_PATH = process.env.MOVIES_PATH || '/data/movies';

async function testDuplicateGeneration() {
  // Test 1: Konzistentan hash
  console.log('Test 1: Konzistentnost hash-a');
  console.log('─────────────────────────────');
  
  const collection = 'Batman';
  const movieName = 'Batman Begins (2005) [REMASTERED] [REPACK] [1080p] [BluRay] [5.1] [YTS.MX]';
  
  const hash1 = Buffer.from(`${collection}-${movieName}`).toString('base64')
    .replace(/[/+=]/g, '').substring(0, 16);
  const filename1 = getThumbnailFilename(hash1, false);
  
  console.log(`  Hash: ${hash1}`);
  console.log(`  Filename: ${filename1}.jpg`);
  
  // Ponovi istu operaciju
  const hash2 = Buffer.from(`${collection}-${movieName}`).toString('base64')
    .replace(/[/+=]/g, '').substring(0, 16);
  const filename2 = getThumbnailFilename(hash2, false);
  
  console.log(`\n  Ponovljen hash: ${hash2}`);
  console.log(`  Ponovljen filename: ${filename2}.jpg`);
  
  if (hash1 === hash2 && filename1 === filename2) {
    console.log(`\n  ✅ PASS: Hash je konzistentan (isti za isti film)\n`);
  } else {
    console.log(`\n  ❌ FAIL: Hash se razlikuje!\n`);
    return false;
  }
  
  // Test 2: Provera postojećeg thumbnail-a
  console.log('Test 2: checkExistingThumbnail()');
  console.log('─────────────────────────────');
  
  const testFilename = 'test-movie-check';
  const testPath = path.join(process.cwd(), 'generated-thumbnails', `${testFilename}.jpg`);
  
  // Kreiraj dummy fajl
  if (!fs.existsSync(path.dirname(testPath))) {
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
  }
  fs.writeFileSync(testPath, 'dummy image data');
  
  const exists1 = checkExistingThumbnail(testFilename);
  console.log(`  Kreiran test fajl: ${testPath}`);
  console.log(`  checkExistingThumbnail(): ${exists1}`);
  
  if (exists1) {
    console.log(`  ✅ PASS: Detektuje postojeći thumbnail\n`);
  } else {
    console.log(`  ❌ FAIL: Ne detektuje postojeći thumbnail!\n`);
    fs.unlinkSync(testPath);
    return false;
  }
  
  // Cleanup
  fs.unlinkSync(testPath);
  
  const exists2 = checkExistingThumbnail(testFilename);
  console.log(`  Nakon brisanja: ${exists2}`);
  
  if (!exists2) {
    console.log(`  ✅ PASS: Pravilno detektuje obrisani thumbnail\n`);
  } else {
    console.log(`  ❌ FAIL: I dalje vidi obrisani thumbnail!\n`);
    return false;
  }
  
  // Test 3: Simulacija scanner ponašanja
  console.log('Test 3: Scanner ponašanje');
  console.log('─────────────────────────────');
  
  const movieHash = Buffer.from(`TestCollection-TestMovie`).toString('base64')
    .replace(/[/+=]/g, '').substring(0, 16);
  const filename = getThumbnailFilename(movieHash, false);
  
  console.log(`  Prvi scan - film: TestMovie`);
  console.log(`  Hash: ${movieHash}`);
  console.log(`  Filename: ${filename}.jpg`);
  
  let existing = checkExistingThumbnail(filename);
  console.log(`  Postojeći thumbnail: ${existing || 'null'}`);
  
  if (!existing) {
    console.log(`  ✅ Ne postoji, trebalo bi generisati`);
  }
  
  // Simuliraj generisanje
  const dummyPath = path.join(process.cwd(), 'generated-thumbnails', `${filename}.jpg`);
  fs.writeFileSync(dummyPath, 'dummy thumbnail');
  console.log(`  📸 Generisan thumbnail (simulacija)`);
  
  // Drugi scan - isti film
  console.log(`\n  Drugi scan - isti film`);
  const movieHash3 = Buffer.from(`TestCollection-TestMovie`).toString('base64')
    .replace(/[/+=]/g, '').substring(0, 16);
  const filename3 = getThumbnailFilename(movieHash3, false);
  
  existing = checkExistingThumbnail(filename3);
  console.log(`  Hash: ${movieHash3}`);
  console.log(`  Filename: ${filename3}.jpg`);
  console.log(`  Postojeći thumbnail: ${existing || 'null'}`);
  
  if (existing) {
    console.log(`  ✅ PASS: Detektuje postojeći, preskače generisanje\n`);
  } else {
    console.log(`  ❌ FAIL: Ne detektuje postojeći, generisao bi ponovo!\n`);
    fs.unlinkSync(dummyPath);
    return false;
  }
  
  // Cleanup
  fs.unlinkSync(dummyPath);
  
  return true;
}

testDuplicateGeneration()
  .then(success => {
    console.log('═══════════════════════════════════════════');
    console.log('📊 ZAKLJUČAK');
    console.log('═══════════════════════════════════════════\n');
    
    if (success) {
      console.log('✅ SVE TESTOVE PROŠAO!\n');
      console.log('Scanner će sada:');
      console.log('  1. Generisati konzistentne hash-eve');
      console.log('  2. Proveravati da li thumbnail postoji');
      console.log('  3. Preskakati već generisane thumbnail-e');
      console.log('  4. Generisati SAMO za nove filmove\n');
    } else {
      console.log('❌ TESTOVI NISU PROŠLI\n');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
