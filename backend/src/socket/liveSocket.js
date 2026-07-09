// backend/src/socket/liveSocket.js
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { CafeLivePost, User } = require("../models");

const TTL_MINUTES = 5;
const TTL_MS = TTL_MINUTES * 60 * 1000;

const cafeRoom = (id) => `cafe:${Number(id)}`;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// ✅ anti spam (SOCKET)
const POST_COOLDOWN_MS = 3000;
const lastPostAt = new Map(); // key => timestamp

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return {
      id: payload.id || payload.user_id || null,
      role: payload.role || null,
      email: payload.email || null,
    };
  } catch {
    return null;
  }
}

// ✅ ambil name dari DB biar pasti benar
async function resolveUserFromToken(token) {
  const info = parseToken(token);
  if (!info?.id) return null;

  const user = await User.findByPk(info.id, {
    attributes: ["id", "name", "role", "email"],
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name || "User",
    role: user.role || info.role || null,
    email: user.email || info.email || null,
  };
}

async function getActivePosts(cafeId) {
  return CafeLivePost.findAll({
    where: {
      cafe_id: cafeId,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [["created_at", "ASC"]],
    limit: 20,
  });
}

async function cleanupExpired(io) {
  const expired = await CafeLivePost.findAll({
    where: { expires_at: { [Op.lte]: new Date() } },
    attributes: ["id", "cafe_id"],
  });

  if (!expired.length) return;

  const ids = expired.map((x) => x.id);
  await CafeLivePost.destroy({ where: { id: ids } });

  const map = {};
  expired.forEach((e) => {
    map[e.cafe_id] ??= [];
    map[e.cafe_id].push(e.id);
  });

  Object.entries(map).forEach(([cafeId, postIds]) => {
    io.to(cafeRoom(cafeId)).emit("live:delete_many", {
      cafe_id: Number(cafeId),
      ids: postIds,
    });
  });
}

function makeRateKey(socket, cafeId) {
  const uid = socket.data.user?.id;
  if (uid) return `u:${uid}:cafe:${cafeId}`;
  const ip = socket.handshake.address || "unknown";
  return `ip:${ip}:cafe:${cafeId}`;
}

function initLiveSocket(io) {
  setInterval(() => cleanupExpired(io).catch(() => {}), 15000);

  io.on("connection", async (socket) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      null;

    socket.data.user = token ? await resolveUserFromToken(token) : null;

    socket.on("live:join", async ({ cafe_id }) => {
      const cafeId = safeNum(cafe_id);
      if (!cafeId) return;

      socket.join(cafeRoom(cafeId));
      const posts = await getActivePosts(cafeId);

      // ✅ history payload konsisten
      socket.emit("live:history", { cafe_id: cafeId, data: posts });
    });

    socket.on("live:leave", ({ cafe_id }) => {
      const cafeId = safeNum(cafe_id);
      if (!cafeId) return;
      socket.leave(cafeRoom(cafeId));
    });

    // ✅ pakai ack callback (client sudah menunggu ack)
    socket.on("live:post", async (payload, ack) => {
      try {
        const user = socket.data.user;
        if (!user?.id) {
          if (typeof ack === "function") return ack({ error: "Unauthorized" });
          return;
        }

        const cafeId = safeNum(payload?.cafe_id);
        const cleanText = String(payload?.text || "").trim();
        const imageUrl = payload?.image_url || null;
        const clientId = payload?.client_id ? String(payload.client_id) : null;

        if (!cafeId) {
          if (typeof ack === "function") return ack({ error: "Cafe tidak valid" });
          return;
        }

        if (!cleanText && !imageUrl) {
          if (typeof ack === "function") return ack({ error: "Isi teks atau foto" });
          return;
        }

        // ✅ rate limit socket
        const key = makeRateKey(socket, cafeId);
        const nowTs = Date.now();
        const prev = lastPostAt.get(key) || 0;
        if (nowTs - prev < POST_COOLDOWN_MS) {
          if (typeof ack === "function") return ack({ error: "Terlalu cepat. Tunggu 3 detik ya." });
          return;
        }
        lastPostAt.set(key, nowTs);

        const now = new Date();
        const post = await CafeLivePost.create({
          cafe_id: cafeId,
          user_id: user.id,
          user_name: user.name || "User",
          text: cleanText.slice(0, 120) || "(tanpa teks)",
          image_url: imageUrl,
          created_at: now,
          expires_at: new Date(now.getTime() + TTL_MS),
        });

        // inject client_id ke payload broadcast (walau DB ga punya kolom)
        const out = post.toJSON ? post.toJSON() : post;
        if (clientId) out.client_id = clientId;

        // ✅ ACK ke pengirim biar FE replace optimistic
        if (typeof ack === "function") ack({ data: out });

        // ✅ broadcast post langsung
        io.to(cafeRoom(cafeId)).emit("live:new", out);
      } catch (e) {
        if (typeof ack === "function") ack({ error: "Gagal membuat post" });
      }
    });

    socket.on("live:react", async (payload, ack) => {
      try {
        const user = socket.data.user;
        if (!user?.id) {
          if (typeof ack === "function") return ack({ error: "Unauthorized" });
          return;
        }

        const postId = safeNum(payload?.post_id);
        const type = payload?.type;

        if (!postId || !["like", "dislike"].includes(type)) {
          if (typeof ack === "function") return ack({ error: "Payload tidak valid" });
          return;
        }

        const post = await CafeLivePost.findByPk(postId);
        if (!post || post.expires_at <= new Date()) {
          if (typeof ack === "function") return ack({ error: "Post tidak ditemukan / kadaluarsa" });
          return;
        }

        if (type === "like") post.likes += 1;
        if (type === "dislike") post.dislikes += 1;
        await post.save();

        const update = {
          cafe_id: post.cafe_id,
          post_id: post.id,
          likes: post.likes,
          dislikes: post.dislikes,
        };

        // ✅ ACK biar client set angka final
        if (typeof ack === "function") ack({ data: { likes: post.likes, dislikes: post.dislikes } });

        // ✅ broadcast konsisten (tanpa patch)
        io.to(cafeRoom(post.cafe_id)).emit("live:update", update);
      } catch (e) {
        if (typeof ack === "function") ack({ error: "Gagal react" });
      }
    });
  });
}

module.exports = { initLiveSocket };
