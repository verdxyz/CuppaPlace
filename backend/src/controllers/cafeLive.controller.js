// backend/src/controllers/cafeLive.controller.js
const { CafeLivePost } = require("../models");
const { Op } = require("sequelize");

const TTL_MINUTES = 5;

// ✅ anti spam (REST)
const POST_COOLDOWN_MS = 3000;
const lastPostAt = new Map(); // key => timestamp

function makeRateKey(req, cafeId) {
  if (req.user?.id) return `u:${req.user.id}:cafe:${cafeId}`;
  return `ip:${req.ip}:cafe:${cafeId}`;
}

exports.getLiveFeed = async (req, res) => {
  try {
    const cafeId = Number(req.params.id);

    const posts = await CafeLivePost.findAll({
      where: {
        cafe_id: cafeId,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
      order: [["created_at", "ASC"]],
      limit: 20,
    });

    res.json({ data: posts });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil live feed" });
  }
};

exports.createLivePost = async (req, res) => {
  try {
    const cafeId = Number(req.params.id);
    const { text, image_url, client_id } = req.body || {};

    if (!text && !image_url) {
      return res.status(400).json({ message: "Teks atau foto wajib diisi" });
    }

    // ✅ rate limit REST
    const key = makeRateKey(req, cafeId);
    const nowTs = Date.now();
    const prev = lastPostAt.get(key) || 0;
    if (nowTs - prev < POST_COOLDOWN_MS) {
      return res.status(429).json({ message: "Terlalu cepat. Tunggu 3 detik ya." });
    }
    lastPostAt.set(key, nowTs);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60 * 1000);

    const post = await CafeLivePost.create({
      cafe_id: cafeId,
      user_id: req.user?.id ?? null,
      user_name: req.user?.name ?? "User",
      text: String(text || "").slice(0, 120) || "(tanpa teks)",
      image_url: image_url ?? null,
      created_at: now,
      expires_at: expiresAt,

      // ✅ opsional (kalau kamu tambahkan kolom di DB)
      // client_id: client_id ?? null,
    });

    // kalau kamu belum bikin kolom client_id di DB, tetap kirim balik via response
    const out = post.toJSON ? post.toJSON() : post;
    if (client_id) out.client_id = String(client_id);

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: "Gagal membuat live post" });
  }
};

exports.reactLivePost = async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const { type } = req.body || {};

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Reaksi tidak valid" });
    }

    const post = await CafeLivePost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    if (post.expires_at <= new Date()) {
      return res.status(410).json({ message: "Post sudah kadaluarsa" });
    }

    if (type === "like") post.likes += 1;
    if (type === "dislike") post.dislikes += 1;

    await post.save();

    res.json({
      likes: post.likes,
      dislikes: post.dislikes,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal memberi reaksi" });
  }
};
