// backend/src/controllers/otp.controller.js
const { OTPCode, OtpCode } = require('../models');
const { compareOtp } = require('../utils/password'); // hashOtp tidak dipakai lagi untuk SEND
const { sendMail, otpTemplate } = require('../utils/email');

// Pilih model yang ada (kompatibel nama lama/baru)
const Model = OTPCode || OtpCode;
if (!Model) {
  throw new Error('OTP model is not registered (OTPCode/OtpCode not found)');
}

// Cek apakah suatu kolom ada
const hasCol = (name) => !!Model.rawAttributes?.[name];

// Deteksi nama kolom actual di DB-mu
// - jenis OTP: 'kind' (baru) atau 'purpose' (lama)
// - tempat menyimpan kode: 'code' (baru, string) atau 'code_hash' (lama)
const COL_KIND = hasCol('kind') ? 'kind' : (hasCol('purpose') ? 'purpose' : 'kind');
const COL_CODE = hasCol('code') ? 'code' : (hasCol('code_hash') ? 'code_hash' : 'code');

function gen6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/auth/send-otp  (juga dipakai /api/otp/send via router fallback FE)
exports.send = async (req, res, next) => {
  try {
    const { email, reason, purpose, kind } = req.body || {};
    const useKind = (reason || purpose || kind || 'register');

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Email invalid' });
    }

    const code = gen6(); // <- SIMPAN POLOS

    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    const payload = {
      email,
      expires_at,
      used_at: null,
    };
    payload[COL_KIND] = useKind;
    payload[COL_CODE] = code; // <-- TIDAK DI-HASH: simpan kode polos

    await Model.create(payload);

    const tpl = otpTemplate(code);
    await sendMail({ to: email, subject: tpl.subject, text: tpl.text, html: tpl.html });

    return res.status(201).json({ ok: true, message: 'OTP sent' });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/verify-otp  (juga dipakai /api/otp/verify via router fallback FE)
exports.verify = async (req, res, next) => {
  try {
    const { email, code, otp, reason, purpose, kind } = req.body || {};
    const inputCode = String(code ?? otp ?? '').replace(/\D/g, ''); // normalisasi 6 digit
    const useKind = (reason || purpose || kind || 'register');

    if (!email || !inputCode) {
      return res.status(400).json({ message: 'email & code required' });
    }

    const where = { email };
    where[COL_KIND] = useKind;

    const row = await Model.findOne({
      where,
      order: [['id', 'DESC']],
    });

    if (!row) return res.status(400).json({ message: 'OTP not found' });
    if (row.used_at) return res.status(400).json({ message: 'OTP already used' });
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const stored = String(row[COL_CODE] ?? '');

    // Jika yang tersimpan polos → bandingkan langsung
    // Jika yang tersimpan hash bcrypt (prefix $2a/$2b/$2y) → fallback ke compareOtp
    let ok = false;
    if (/^\$2[aby]\$/.test(stored)) {
      ok = await compareOtp(inputCode, stored);
    } else {
      ok = stored === inputCode;
    }

    if (!ok) return res.status(400).json({ message: 'OTP incorrect' });

    row.used_at = new Date();
    await row.save();

    return res.json({ ok: true, message: 'OTP verified' });
  } catch (e) {
    next(e);
  }
};
