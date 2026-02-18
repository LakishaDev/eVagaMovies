# eVagaMovies - Production Deployment Guide

## 🎬 Production Setup Complete!

### Services Configuration

- **Frontend**: Port 80 (http://filmovi.local or http://10.0.0.3)
- **Backend**: Port 3001 (http://10.0.0.3:3001)
- **Pihole Admin**: Port 8080 (http://10.0.0.3:8080/admin)

---

## 🚀 Quick Start

### Start Production Services

```bash
cd /home/lakisha/eVagaMovies
./start-production.sh
```

This script will:

1. Build the frontend for production
2. Stop any existing PM2 processes
3. Start both backend and frontend with PM2
4. Configure PM2 to auto-start on system reboot

### Stop All Services

```bash
./stop-production.sh
```

---

## 📋 PM2 Commands

### View Running Processes

```bash
pm2 list
```

### View Logs

```bash
# All logs
pm2 logs

# Backend logs only
pm2 logs evagamovies-backend

# Frontend logs only
pm2 logs evagamovies-frontend
```

### Restart Services

```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart evagamovies-backend
pm2 restart evagamovies-frontend
```

### Stop/Start Services

```bash
pm2 stop all
pm2 start all
```

### Monitor Resources

```bash
pm2 monit
```

---

## 🌐 Domain Access

The custom domain `filmovi.local` has been configured in `/etc/hosts`.

Access your movie library at:

- http://filmovi.local
- http://10.0.0.3

**Note**: The `filmovi.local` domain only works on this machine. To access from other devices on your network, use the IP address (http://10.0.0.3).

---

## 🔧 Configuration Files

- **PM2 Configuration**: `ecosystem.config.cjs`
- **Vite Configuration**: `frontend/vite.config.js`
- **Pihole Configuration**: `/etc/pihole/pihole.toml` (backup: `/etc/pihole/pihole.toml.backup`)

---

## 📝 Logs Location

All logs are stored in `/home/lakisha/eVagaMovies/logs/`:

- `backend-error.log` - Backend errors
- `backend-out.log` - Backend output
- `frontend-error.log` - Frontend errors
- `frontend-out.log` - Frontend output

---

## 🔄 Development Mode

If you need to run in development mode:

### Backend (Terminal 1)

```bash
cd /home/lakisha/eVagaMovies/backend
npm start
```

### Frontend (Terminal 2)

```bash
cd /home/lakisha/eVagaMovies/frontend
sudo npm run dev  # sudo required for port 80
```

---

## 🛠️ Troubleshooting

### Port 80 Already in Use

```bash
# Check what's using port 80
sudo netstat -tlnp | grep :80

# Stop PM2 services
pm2 stop all
```

### Rebuild Frontend

```bash
cd /home/lakisha/eVagaMovies/frontend
npm run build
pm2 restart evagamovies-frontend
```

### Check Service Status

```bash
pm2 status
pm2 logs --lines 50
```

### Reset Everything

```bash
./stop-production.sh
./start-production.sh
```

---

## 📱 Accessing from Other Devices

To access from other devices on your network (phones, tablets, other computers):

1. Open browser on the device
2. Navigate to: `http://10.0.0.3`

To use `filmovi.local` on other devices, you need to:

- Add the same entry to their `/etc/hosts` file (Linux/Mac)
- Or add to `C:\Windows\System32\drivers\etc\hosts` (Windows)
- Or configure your router's DNS to point `filmovi.local` to `10.0.0.3`

---

## 🔐 Security Notes

- Frontend runs on port 80 (requires sudo)
- PM2 is configured to restart services automatically on failure
- Logs are rotated to prevent disk space issues

---

## 📦 What Changed

1. **Pihole**: Moved from port 80 to port 8080
2. **Frontend**: Now serves on port 80 (production build)
3. **PM2**: Manages both backend and frontend processes
4. **Custom Domain**: `filmovi.local` added to `/etc/hosts`

---

## ✅ Verification

After running `./start-production.sh`, verify everything is working:

```bash
# Check PM2 status
pm2 list

# Check ports
sudo netstat -tlnp | grep -E ":(80|3001|8080)"

# Test frontend
curl -I http://filmovi.local

# Test backend
curl http://10.0.0.3:3001/api/movies | head -20
```

---

Enjoy your movie library! 🎬🍿
