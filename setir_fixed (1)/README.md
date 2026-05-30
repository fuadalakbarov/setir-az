# Sətir.az — Deployment Təlimatı

## Railway.app ilə Pulsuz Deploy (15 dəqiqə)

### 1. GitHub-a yüklə
1. https://github.com açın
2. "New repository" → adı: `setir-az`
3. Bu qovluqdakı faylları yükləyin (upload files)

### 2. Railway-ə qoş
1. https://railway.app açın
2. GitHub ilə giriş edin
3. "New Project" → "Deploy from GitHub repo"
4. `setir-az` repo-nu seçin

### 3. PostgreSQL əlavə et
1. Railway dashboard-da "+ New" → "Database" → "PostgreSQL"
2. Avtomatik `DATABASE_URL` yaranır

### 4. Environment Variables əlavə et
Railway → Settings → Variables:
```
GEMINI_API_KEY = AIzaSyC5SSFguRM-2Sgns6-9Q4rSGOI8suvc4e4
JWT_SECRET     = setir2025gizlikey123456789abcdef
NODE_ENV       = production
```

### 5. Database cədvəllərini yarat
Railway → PostgreSQL → Query:
```sql
-- schema.sql faylındakı kodu yapışdırın
```

### 6. Deploy!
Railway avtomatik deploy edəcək.
URL: `https://setir-az.up.railway.app`

---

## Yerli (local) işlətmək üçün

```bash
npm install
# .env faylını düzenle
node src/index.js
```

Sonra: http://localhost:3000
