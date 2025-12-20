#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * FFmpeg Auto-Installer Agent
 * Automatski detektuje OS i instalira FFmpeg
 */

// Provera da li je FFmpeg već instaliran
async function isFfmpegInstalled() {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    return stdout.includes('ffmpeg version');
  } catch (error) {
    return false;
  }
}

// Detekcija operativnog sistema
async function detectOS() {
  try {
    const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
    
    if (osRelease.includes('ID=fedora')) return 'fedora';
    if (osRelease.includes('ID=ubuntu') || osRelease.includes('ID=debian')) return 'debian';
    if (osRelease.includes('ID=arch')) return 'arch';
    if (osRelease.includes('ID=rhel') || osRelease.includes('ID=centos')) return 'rhel';
    
    return 'unknown';
  } catch (error) {
    // macOS or Windows
    if (process.platform === 'darwin') return 'macos';
    if (process.platform === 'win32') return 'windows';
    return 'unknown';
  }
}

// Instalacija FFmpeg-a na osnovu OS-a
async function installFfmpeg(os) {
  console.log(`\n🔧 Detektovan OS: ${os}`);
  console.log('📦 Instaliranje FFmpeg-a...\n');

  let installCommand;

  switch (os) {
    case 'fedora':
      installCommand = 'sudo dnf install -y ffmpeg';
      break;
    
    case 'debian':
      installCommand = 'sudo apt update && sudo apt install -y ffmpeg';
      break;
    
    case 'arch':
      installCommand = 'sudo pacman -S --noconfirm ffmpeg';
      break;
    
    case 'rhel':
      installCommand = 'sudo yum install -y ffmpeg';
      break;
    
    case 'macos':
      console.log('❌ macOS detektovan. Molimo instalirajte Homebrew pa pokrenite:');
      console.log('   brew install ffmpeg');
      return false;
    
    case 'windows':
      console.log('❌ Windows detektovan. Molimo preuzmite FFmpeg sa:');
      console.log('   https://ffmpeg.org/download.html');
      return false;
    
    default:
      console.log('❌ Nepoznat operativni sistem.');
      return false;
  }

  try {
    console.log(`Izvršavam: ${installCommand}\n`);
    
    const { stdout, stderr } = await execAsync(installCommand, {
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    return true;
  } catch (error) {
    console.error('❌ Greška prilikom instalacije:', error.message);
    
    // Možda je potreban sudo pristup
    if (error.message.includes('permission') || error.message.includes('sudo')) {
      console.log('\n⚠️  Potrebne su admin privilegije!');
      console.log(`Pokrenite ručno: ${installCommand}`);
    }
    
    return false;
  }
}

// Verifikacija instalacije
async function verifyInstallation() {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    const versionMatch = stdout.match(/ffmpeg version ([^\s]+)/);
    
    if (versionMatch) {
      console.log(`\n✅ FFmpeg uspešno instaliran!`);
      console.log(`📌 Verzija: ${versionMatch[1]}\n`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ FFmpeg nije pronađen nakon instalacije.');
    return false;
  }
}

// Glavna funkcija agenta
async function autoInstallFfmpeg() {
  console.log('🎬 FFmpeg Auto-Installer Agent');
  console.log('================================\n');

  // Proveri da li je već instaliran
  const alreadyInstalled = await isFfmpegInstalled();
  
  if (alreadyInstalled) {
    console.log('✅ FFmpeg je već instaliran!');
    await verifyInstallation();
    return true;
  }

  console.log('⚠️  FFmpeg nije pronađen.');
  
  // Detektuj OS
  const os = await detectOS();
  
  // Instaliraj
  const installed = await installFfmpeg(os);
  
  if (!installed) {
    console.log('\n❌ Automatska instalacija nije uspela.');
    console.log('Molimo instalirajte FFmpeg ručno.\n');
    return false;
  }

  // Verifikuj
  const verified = await verifyInstallation();
  
  if (verified) {
    console.log('🎉 Thumbnail generisanje je sada omogućeno!');
    console.log('Restartujte server da bi aktivirali funkcionalnost.\n');
  }
  
  return verified;
}

// Export funkcija
export {
  isFfmpegInstalled,
  detectOS,
  installFfmpeg,
  verifyInstallation,
  autoInstallFfmpeg
};

// Ako se pokrene direktno
if (import.meta.url === `file://${process.argv[1]}`) {
  autoInstallFfmpeg()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
