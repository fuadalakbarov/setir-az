const pool = require('../config/db');

const requirePlan = (...allowedPlans) => async (req, res, next) => {
  try {
    const result = await pool.query('SELECT plan FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user || !allowedPlans.includes(user.plan)) {
      return res.status(403).json({ error: `Bu funksiya üçün ${allowedPlans.join(' və ya ')} planı lazımdır.`, upgrade: true });
    }
    req.userPlan = user.plan;
    next();
  } catch {
    res.status(500).json({ error: 'Server xətası.' });
  }
};

module.exports = { requirePlan };
