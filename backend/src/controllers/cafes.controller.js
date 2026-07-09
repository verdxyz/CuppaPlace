// backend/src/controllers/cafes.controller.js
const { Op } = require("sequelize");
const { Cafe, Menu, CafeGallery } = require("../models");

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(v) {
    return (v * Math.PI) / 180;
  }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function baseUrl(req) {
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  return `${req.protocol}://${req.get("host")}`;
}

function toPublicUrl(req, p) {
  if (!p) return null;

  // kalau sudah absolute url, return as-is
  if (/^https?:\/\//i.test(p)) return p;

  const s = String(p).replace(/\\/g, "/");

  // kalau ada accidental absolute path yg mengandung /uploads/
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

  // normalize galleries (kalau ikut di-include)
  const galleriesRaw = cafeJson.galleries || cafeJson.CafeGalleries || null;
  if (Array.isArray(galleriesRaw)) {
    out.galleries = galleriesRaw.map((g) => ({
      ...g,
      image_url: g.image_url ? toPublicUrl(req, g.image_url) : null,
    }));
  }

  return out;
}

// fallback converter kalau masih ada yg ngirim file.path
function toUploadsPath(p) {
  if (!p) return null;
  const s = String(p).replace(/\\/g, "/");

  const idx = s.lastIndexOf("/uploads/");
  if (idx >= 0) return s.slice(idx); // "/uploads/..."

  if (s.startsWith("uploads/")) return `/${s}`;
  if (s.startsWith("/uploads/")) return s;

  return null;
}

exports.list = async (req, res, next) => {
  try {
    const { search, lat, lng, radius = 0, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const rows = await Cafe.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["id", "ASC"]],
      include: CafeGallery
        ? [
            {
              model: CafeGallery,
              as: "galleries",
              attributes: ["id", "image_url", "createdAt", "updatedAt"],
              required: false,
            },
          ]
        : [],
    });

    let data = rows.map((r) => normalizeCafe(req, r.toJSON()));

    if (
      lat &&
      lng &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng))
    ) {
      const R = Number(radius) || 0;
      data = data.map((d) => {
        const has = d.lat != null && d.lng != null;
        const dist = has
          ? haversine(Number(lat), Number(lng), Number(d.lat), Number(d.lng))
          : null;
        return { ...d, distance_m: dist };
      });

      if (R > 0) {
        data = data.filter((d) => d.distance_m != null && d.distance_m <= R);
      }
      data.sort(
        (a, b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity)
      );
    }

    res.json({ data });
  } catch (e) {
    next(e);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id, {
      include: CafeGallery
        ? [
            {
              model: CafeGallery,
              as: "galleries",
              attributes: ["id", "image_url", "createdAt", "updatedAt"],
              required: false,
            },
          ]
        : [],
    });

    if (!cafe) return res.status(404).json({ message: "Cafe not found" });
    res.json(normalizeCafe(req, cafe.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowed = [
      "name",
      "description",
      "address",
      "lat",
      "lng",
      "instagram",
      "opening_hours",
      "cover_url",
      "logo_url",
      "phone",
    ];

    for (const k of allowed) {
      if (req.body[k] !== undefined) cafe[k] = req.body[k];
    }

    await cafe.save();
    res.json(normalizeCafe(req, cafe.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.updateMedia = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const files = req.files || {};
    const coverFile = files.cover?.[0] || null;
    const logoFile = files.logo?.[0] || null;

    if (!coverFile && !logoFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ pakai filename (paling stabil)
    if (coverFile?.filename) {
      cafe.cover_url = `/uploads/covers/${coverFile.filename}`;
    } else if (coverFile?.path) {
      const p = toUploadsPath(coverFile.path);
      if (!p) return res.status(500).json({ message: "Invalid cover path" });
      cafe.cover_url = p;
    }

    if (logoFile?.filename) {
      cafe.logo_url = `/uploads/logos/${logoFile.filename}`;
    } else if (logoFile?.path) {
      const p = toUploadsPath(logoFile.path);
      if (!p) return res.status(500).json({ message: "Invalid logo path" });
      cafe.logo_url = p;
    }

    await cafe.save();

    // return with normalized urls
    const fresh = await Cafe.findByPk(cafe.id, {
      include: CafeGallery
        ? [
            {
              model: CafeGallery,
              as: "galleries",
              attributes: ["id", "image_url", "createdAt", "updatedAt"],
              required: false,
            },
          ]
        : [],
    });

    res.json(normalizeCafe(req, fresh ? fresh.toJSON() : cafe.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.menu = async (req, res, next) => {
  try {
    const rows = await Menu.findAll({
      where: { cafe_id: req.params.id },
      order: [["id", "ASC"]],
    });
    res.json({ data: rows });
  } catch (e) {
    next(e);
  }
};

// TAMBAHKAN di backend/src/controllers/cafes.controller.js

exports.addGallery = async (req, res, next) => {
  try {
    const { Cafe, CafeGallery } = require("../models");

    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ message: "No gallery files uploaded" });
    }

    if (!CafeGallery) {
      return res.status(500).json({ message: "CafeGallery model not found" });
    }

    const rows = files
      .filter((f) => f && f.filename)
      .map((f) => ({
        cafe_id: cafe.id,
        image_url: `/uploads/galleries/${f.filename}`,
      }));

    if (!rows.length) {
      return res.status(400).json({ message: "No valid gallery files" });
    }

    await CafeGallery.bulkCreate(rows);

    // return cafe detail (include galleries)
    const fresh = await Cafe.findByPk(cafe.id, {
      include: [
        {
          model: CafeGallery,
          as: "galleries",
          attributes: ["id", "image_url", "createdAt", "updatedAt"],
          required: false,
        },
      ],
    });

    // pakai normalizeCafe yang sudah ada di file controller
    res.json(normalizeCafe(req, fresh.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.deleteGallery = async (req, res, next) => {
  try {
    const { Cafe, CafeGallery } = require("../models");

    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!CafeGallery) {
      return res.status(500).json({ message: "CafeGallery model not found" });
    }

    const row = await CafeGallery.findOne({
      where: { id: req.params.galleryId, cafe_id: cafe.id },
    });

    if (!row) return res.status(404).json({ message: "Gallery not found" });

    await row.destroy();

    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};


exports.reports = async (req, res, next) => {
  try {
    const { period = "daily" } = req.query;

    let series;
    if (period === "monthly") {
      series = [
        { name: "Jan", value: 120 },
        { name: "Feb", value: 140 },
        { name: "Mar", value: 160 },
        { name: "Apr", value: 180 },
      ];
    } else if (period === "yearly") {
      series = [
        { name: "2022", value: 1200 },
        { name: "2023", value: 1500 },
        { name: "2024", value: 1800 },
      ];
    } else {
      series = [
        { name: "Senin", value: 30 },
        { name: "Selasa", value: 45 },
        { name: "Rabu", value: 35 },
        { name: "Kamis", value: 50 },
        { name: "Jumat", value: 60 },
        { name: "Sabtu", value: 70 },
        { name: "Minggu", value: 55 },
      ];
    }

    const total = series.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    res.json({ series, total });
  } catch (e) {
    next(e);
  }
};
