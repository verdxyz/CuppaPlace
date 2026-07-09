// app.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// routes (sesuaikan nama file routes kamu)
const authRoutes = require("./routes/auth.routes");
const mitraRoutes = require("./routes/mitra.routes");
const cafeRoutes = require("./routes/cafes.routes");
const menuRoutes = require("./routes/menus.routes");
const userRoutes = require("./routes/users.routes");
const favoriteRoutes = require("./routes/favorites.routes");
const reviewRoutes = require("./routes/reviews.routes");
const uploadRoutes = require("./routes/uploads.routes");
const liveRoutes = require("./routes/cafeLive.routes");


const app = express();

/** ========= CORS =========
 * Frontend Next.js biasanya http://localhost:3000
 * Kalau env kosong, default allow semua (dev).
 */
const allowedOrigins =
  (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman
      if (allowedOrigins.length === 0) return cb(null, true); // dev bebas
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: false, // kamu pakai Bearer token, bukan cookie
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

/** ========= STATIC UPLOADS =========
 * URL publik: http://localhost:4000/uploads/namafile.jpg
 * Pastikan folder uploads ada.
 */
const uploadsDir = path.resolve(__dirname, "..", "uploads");

app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));

// health check
app.get("/api/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

/** ========= API ROUTES (KONSISTEN) ========= */
app.use("/api/auth", authRoutes);
app.use("/api/mitra", mitraRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/menus", menuRoutes);

// user + favorites (favorit biasanya under /api/users)
app.use("/api/users", userRoutes);
app.use("/api/users", favoriteRoutes);

// reviews & uploads
app.use("/api/reviews", reviewRoutes);
app.use("/api/uploads", uploadRoutes);

// live feed
app.use("/api", liveRoutes);



// 404
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// error handler
app.use((err, req, res, next) => {
  console.error("[error]", err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
});
app.set("trust proxy", 1);


module.exports = app;
