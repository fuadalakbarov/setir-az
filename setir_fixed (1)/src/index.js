require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Statik fayllar (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/texts',        require('./routes/texts'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/ai',           require('./routes/ai'));

// Sağlamlıq yoxlaması
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sətir API', time: new Date().toISOString() });
});

// Bütün digər sorğuları frontend-ə yönləndir
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tapılmadı.' });
});

// Global xəta tutma
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Gözlənilməz xəta baş verdi.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sətir API işləyir: http://localhost:${PORT}`);
});
