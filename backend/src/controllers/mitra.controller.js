// backend/src/controllers/mitra.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize, User, Cafe, CafeGallery } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function baseUrl(req) {
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  return `${req.protocol}://${req.get("host")}`;
}

function toPublicUrl(req, p) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;

  const s = String(p).replace(/\\/g, "/");
  const idx = s.lastIndexOf("/uploads/");
  const clean = idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/${s}`;
  return `${baseUrl(req)}${clean}`;
}

function normalizeCafe(req, cafeJson) {
  const out = {
    ...cafeJson,
    cover_url: cafeJson.cover_url ? toPublicUrl(req, cafeJson.cover_url) : null,
    logo_url: cafeJson.logo_url ? toPublicUrl(req, cafeJson.logo_url) : null,
  };

  if (Array.isArray(cafeJson.galleries)) {
    out.galleries = cafeJson.galleries.map((g) => ({
      ...g,
      image_url: g.image_url ? toPublicUrl(req, g.image_url) : null,
    }));
  }

  return out;
}

async function registerMitra(req, res) {
  const t = await sequelize.transaction();
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
      opening_hours,
      fasilitas, // boleh ada walau belum dipakai
    } = req.body || {};

    if (!name || !email || !password || !cafe_name) {
      await t.rollback();
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    const existed = await User.findOne({ where: { email } });
    if (existed) {
      await t.rollback();
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    // file dari multer (optional)
    const files = req.files || {};
    const logoFile = files.logo?.[0] || null;
    const coverFile = files.cover?.[0] || null;

    // ✅ pastikan gallery array
    const galleryFiles = Array.isArray(files.gallery) ? files.gallery : [];

    // SIMPAN RELATIVE PATH
    const logoRel = logoFile?.filename ? `/uploads/logos/${logoFile.filename}` : null;
    const coverRel = coverFile?.filename ? `/uploads/covers/${coverFile.filename}` : null;

    // opening_hours bisa dikirim sebagai string JSON dari FormData
    let openingHoursJson = null;
    if (opening_hours) {
      try {
        openingHoursJson =
          typeof opening_hours === "string" ? JSON.parse(opening_hours) : opening_hours;
      } catch {
        openingHoursJson = null;
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        name,
        email,
        password_hash: hash,
        phone: phone || null,
        role: "mitra",
      },
      { transaction: t }
    );

    const cafe = await Cafe.create(
      {
        name: cafe_name,
        address: address || null,
        lat: lat ?? null,
        lng: lng ?? null,
        instagram: instagram || null,
        owner_id: user.id,
        logo_url: logoRel,
        cover_url: coverRel,
        opening_hours: openingHoursJson,
      },
      { transaction: t }
    );

    // ✅ simpan gallery setelah cafe dibuat
    if (CafeGallery && galleryFiles.length > 0) {
      const cafeId = cafe.id;

      const rows = galleryFiles
        .filter((f) => f && f.filename)
        .map((f) => ({
          cafe_id: cafeId,
          image_url: `/uploads/galleries/${f.filename}`,
        }));

      if (rows.length) {
        await CafeGallery.bulkCreate(rows, { transaction: t });
      }
    }

    await t.commit();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // reload with galleries biar response lengkap
    const freshCafe = await Cafe.findByPk(cafe.id, {
      include: CafeGallery
        ? [
            {
              model: CafeGallery,
              as: "galleries",
              attributes: ["id", "image_url"], // ✅ jangan minta createdAt dulu
              required: false,
            },
          ]
        : [],
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      cafe: normalizeCafe(req, freshCafe ? freshCafe.toJSON() : cafe.toJSON()),
    });
  } catch (err) {
    await t.rollback();
    console.error("registerMitra error:", err);
    return res.status(500).json({ message: "Gagal mendaftarkan mitra." });
  }
}


async function getMitraDashboard(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cafes = await Cafe.findAll({ where: { owner_id: userId } });

    const metrics = {
      daily_sales: 120,
      monthly_sales: 450,
      avg_rating: 4.5,
      review_count: 320,
      favorites: 89,
      series_daily: [
        { name: "Senin", value: 30 },
        { name: "Selasa", value: 50 },
        { name: "Rabu", value: 35 },
        { name: "Kamis", value: 55 },
        { name: "Jumat", value: 45 },
        { name: "Sabtu", value: 60 },
        { name: "Minggu", value: 60 },
      ],
    };

    return res.json({
      cafes: cafes.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
      })),
      cards: {
        daily_sales: metrics.daily_sales,
        monthly_sales: metrics.monthly_sales,
        avg_rating: metrics.avg_rating,
        review_count: metrics.review_count,
        favorites_count: metrics.favorites,
      },
      visitors: metrics.series_daily,
      recommendations: cafes.length
        ? cafes.map((c) => `Promosikan ${c.name} dengan diskon spesial minggu ini`)
        : ["Belum ada data cukup, mulai kumpulkan transaksi dan ulasan."],
    });
  } catch (err) {
    console.error("getMitraDashboard error:", err);
    return res.status(500).json({ message: "Gagal memuat dashboard." });
  }
}

module.exports = { registerMitra, getMitraDashboard };
