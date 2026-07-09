const express = require('express');
const { getPool } = require('../utils/db');

const router = express.Router();

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post(['/auth/send-otp','/otp/send'], async (req, res, next) => {
  try {
    const { email, reason } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email required' });
    const code = genCode();
    const pool = await getPool();
    await pool.query(
      'INSERT INTO otp_codes (email, code, reason, expires_at, created_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), UTC_TIMESTAMP())',
      [email, code, reason || 'register']
    );
    console.log('[OTP] send to', email, 'code:', code);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post(['/auth/verify-otp','/otp/verify'], async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );
    if (rows.length === 0) return res.status(400).json({ message: 'OTP invalid/expired' });
    const row = rows[0];
    await pool.query('UPDATE otp_codes SET used_at = UTC_TIMESTAMP() WHERE id = ?', [row.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
