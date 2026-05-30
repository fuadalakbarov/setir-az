const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Bu email artıq qeydiyyatdan keçib.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, plan',
      [name, email, hashed]
    );
    const user = result.rows[0];
    await pool.query('INSERT INTO subscriptions (user_id, plan) VALUES ($1, $2)', [user.id, 'free']);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Qeydiyyat uğurlu oldu!', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xətası.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Email və ya şifrə yanlışdır.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email və ya şifrə yanlışdır.' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Giriş uğurlu oldu!', token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xətası.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, plan, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server xətası.' });
  }
};

module.exports = { register, login, getProfile };
