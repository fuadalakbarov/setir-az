const pool = require('../config/db');

const getSubscription = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.*, u.name, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1',
      [req.user.id]
    );
    res.json(result.rows[0] || { plan: 'free', status: 'active' });
  } catch (err) {
    res.status(500).json({ error: 'Server xətası.' });
  }
};

const updateSubscription = async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'premium', 'business'].includes(plan)) {
    return res.status(400).json({ error: 'Yanlış plan.' });
  }
  try {
    await pool.query('UPDATE subscriptions SET plan = $1 WHERE user_id = $2', [plan, req.user.id]);
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, req.user.id]);
    res.json({ message: `${plan} planına keçildi.`, plan });
  } catch (err) {
    res.status(500).json({ error: 'Server xətası.' });
  }
};

module.exports = { getSubscription, updateSubscription };
