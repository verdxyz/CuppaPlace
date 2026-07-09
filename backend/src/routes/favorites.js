const express = require('express');
const { getPool } = require('../utils/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/users/me/favorites', auth(true), async (req, res, next) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT c.* FROM favorites f
       JOIN cafes c ON c.id = f.cafe_id
       WHERE f.user_id = ? ORDER BY f.id DESC`, [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/users/me/favorites/:cafeId', auth(true), async (req, res, next) => {
  try {
    const cafeId = Number(req.params.cafeId);
    const pool = await getPool();
    await pool.query('INSERT IGNORE INTO favorites (user_id, cafe_id, created_at) VALUES (?, ?, NOW())', [req.user.id, cafeId]);
    res.status(204).send();
  } catch (e) { next(e); }
});

router.delete('/users/me/favorites/:cafeId', auth(true), async (req, res, next) => {
  try {
    const cafeId = Number(req.params.cafeId);
    const pool = await getPool();
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND cafe_id = ?', [req.user.id, cafeId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
