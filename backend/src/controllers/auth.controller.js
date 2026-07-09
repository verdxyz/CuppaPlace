// backend/src/controllers/auth.controller.js
const crypto = require('crypto');
const { User, Cafe, PasswordResetToken } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../middlewares/auth');
const { sendMail } = require('../utils/email');

// ============ REGISTER USER BIASA ============
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone,
      password_hash,
      role: 'user',
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

// ============ LOGIN ============
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email & password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

// ============ ME ============
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'avatar_url',
        'created_at',
        'updated_at',
      ],
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

// ============ REGISTER MITRA ============
exports.registerMitra = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      cafe_name,
      address,
      lat,
      lng,
      instagram,
    } = req.body || {};

    if (!name || !email || !password || !cafe_name) {
      return res
        .status(400)
        .json({ message: 'name, email, password, cafe_name required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone,
      password_hash,
      role: 'mitra',
    });

    const cafe = await Cafe.create({
      owner_id: user.id,
      name: cafe_name,
      address: address || null,
      lat: lat ?? null,
      lng: lng ?? null,
      instagram: instagram || null,
      is_active: true,
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      cafe,
    });
  } catch (e) {
    next(e);
  }
};

// ============ FORGOT PASSWORD ============
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    const user = await User.findOne({ where: { email } });

    // Supaya tidak bisa tebak email mana yang ada / nggak ada di sistem
    if (!user) {
      return res.json({
        message:
          'Jika email terdaftar, link reset password telah dikirim ke inbox.',
      });
    }

    // Hapus token-token sebelumnya untuk user ini (optional, tapi rapi)
    await PasswordResetToken.destroy({
      where: { user_id: user.id },
    });

    // Generate token random
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 menit

    await PasswordResetToken.create({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    const frontendBaseRaw =
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      "https://cuppaplace.web.id";

    const frontendBase = String(frontendBaseRaw).replace(/\/+$/, ""); // trim trailing "/"

    const resetPath = process.env.RESET_PASSWORD_PATH || "/reset-password";

    const resetUrl = `${frontendBase}${resetPath}?token=${encodeURIComponent(token)}`;


    try {
      await sendMail({
        to: email,
        subject: 'Reset Password Akun Cuppa',
        text:
          'Kami menerima permintaan untuk mengatur ulang password akun Anda.\n' +
          `Klik tautan berikut untuk mengatur ulang password:\n${resetUrl}\n\n` +
          'Tautan ini berlaku selama 30 menit.\nJika Anda tidak merasa meminta reset password, abaikan email ini.',
        html: `
          <p>Halo,</p>
          <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
          <p>Klik tautan berikut untuk mengatur ulang password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Tautan ini berlaku selama 30 menit.</p>
          <p>Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
        `,
      });
    } catch (e) {
      console.error('Gagal mengirim email reset password:', e);
    }

    return res.json({
      message:
        'Jika email terdaftar, link reset password telah dikirim ke inbox.',
    });
  } catch (err) {
    next(err);
  }
};

// ============ RESET PASSWORD ============
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: 'Token dan password baru wajib diisi.' });
    }

    // Cari record token di DB
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Token tidak valid.' });
    }

    if (resetToken.used_at) {
      return res.status(400).json({ message: 'Token sudah digunakan.' });
    }

    if (resetToken.expires_at && new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Token telah kadaluarsa.' });
    }

    // Ambil user dari token
    const user = await User.findByPk(resetToken.user_id);
    if (!user) {
      return res.status(400).json({ message: 'User untuk token ini tidak ditemukan.' });
    }

    // Hash & simpan password baru
    const password_hash = await hashPassword(password);
    user.password_hash = password_hash;
    await user.save();

    // Tandai token sudah dipakai
    resetToken.used_at = new Date();
    await resetToken.save();

    return res.json({
      message: 'Password berhasil direset. Silakan login.',
    });
  } catch (err) {
    console.error('[resetPassword] error:', err);
    next(err);
  }
};

// ============ LOGOUT (opsional, buat apiLogout) ============
exports.logout = async (req, res, next) => {
  try {
    return res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    next(err);
  }
};
