# 🎬 eVagaMovies Production Setup - ZAVRŠENO! ✅

## ✅ Što je urađeno:

### 1. **Pihole** - Prebačen sa porta 80 na 8080

- Admin dashboard: **http://10.0.0.3:8080/admin**
- Backup konfiguracije: `/etc/pihole/pihole.toml.backup`

### 2. **Frontend** - Na portu 80

- Glavni pristup: **http://10.0.0.3** ili **http://filmovi.local**
- Production build serviran sa `serve` paketom
- Upravlja se preko PM2

### 3. **Backend** - Na portu 3001

- API endpoint: **http://10.0.0.3:3001/api/movies**
- Upravlja se preko PM2

### 4. **Custom Domain** - filmovi.local

- Dodat u `/etc/hosts`
- Pristup: **http://filmovi.local**

---

## 🚀 Kako pokrenuti produkciju:

```bash
cd /home/lakisha/eVagaMovies
./start-production.sh
```

## 🛑 Kako zaustaviti servise:

```bash
cd /home/lakisha/eVagaMovies
./stop-production.sh
```

---

## 📋 PM2 Komande:

```bash
# Status servisa
sudo pm2 list

# Logovi
sudo pm2 logs                        # Svi logovi
sudo pm2 logs evagamovies-frontend   # Samo frontend
sudo pm2 logs evagamovies-backend    # Samo backend

# Restart
sudo pm2 restart all
sudo pm2 restart evagamovies-frontend
sudo pm2 restart evagamovies-backend

# Stop
sudo pm2 stop all

# Monitoring
sudo pm2 monit
```

---

## 🌐 Pristup:

| Servis           | URL                                      | Port |
| ---------------- | ---------------------------------------- | ---- |
| **Frontend**     | http://filmovi.local ili http://10.0.0.3 | 80   |
| **Backend API**  | http://10.0.0.3:3001/api/movies          | 3001 |
| **Pihole Admin** | http://10.0.0.3:8080/admin               | 8080 |

---

## 📱 Pristup sa drugih uređaja:

Sa telefona, tableta ili drugih računara na istoj mreži:

- Otvori browser i idi na: **http://10.0.0.3**

Za `filmovi.local` domen, potrebno je dodati u hosts fajl na svakom uređaju:

```
10.0.0.3    filmovi.local
```

---

## ⚙️ Tehnički detalji:

- **PM2**: Procesni menadžer za Node.js aplikacije
- **Serve**: Static file server za production frontend
- **Node.js**: v24.12.0
- **Vite**: v7.3.0 (za development i build)

---

## 📝 Fajlovi:

- **PM2 Config**: `/home/lakisha/eVagaMovies/ecosystem.config.cjs`
- **Start Script**: `/home/lakisha/eVagaMovies/start-production.sh`
- **Stop Script**: `/home/lakisha/eVagaMovies/stop-production.sh`
- **Setup Domain**: `/home/lakisha/eVagaMovies/setup-domain.sh`
- **Logovi**: `/home/lakisha/eVagaMovies/logs/`

---

## ✅ Verifikacija:

```bash
# Provera portova
sudo netstat -tlnp | grep -E ":80[^0-9]|:3001|:8080"

# Test frontend
curl http://filmovi.local

# Test backend
curl http://10.0.0.3:3001/api/movies | head -20

# PM2 status
sudo pm2 list
```

---

## 🎉 Sve radi! Uživaj u filmovima! 🍿
