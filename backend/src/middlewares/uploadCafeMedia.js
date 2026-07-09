const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

function fileFilter(req, file, cb) {
  const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.mimetype);
  if (!ok) return cb(new Error("Only image files allowed"));
  cb(null, true);
}

function filename(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const name = crypto.randomBytes(16).toString("hex");
  cb(null, `${name}${ext}`);
}

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const DIR_LOGOS = path.join(UPLOAD_ROOT, "logos");
const DIR_COVERS = path.join(UPLOAD_ROOT, "covers");
const DIR_GALLERIES = path.join(UPLOAD_ROOT, "galleries");

// pastikan folder ada
for (const d of [UPLOAD_ROOT, DIR_LOGOS, DIR_COVERS, DIR_GALLERIES]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =
      file.fieldname === "cover"
        ? DIR_COVERS
        : file.fieldname === "gallery"
        ? DIR_GALLERIES
        : DIR_LOGOS; // default logo
    cb(null, dir);
  },
  filename,
});

const uploadCafeMedia = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadCafeMedia, UPLOAD_ROOT };
