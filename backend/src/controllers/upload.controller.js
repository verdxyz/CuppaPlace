const fs = require("fs");
const path = require("path");

// memastikan root uploads ada
exports.ensureUploadRoot = (rootAbs) => {
  try {
    fs.mkdirSync(rootAbs, { recursive: true });
    for (const d of ["logos", "covers", "gallery", "tmp"]) {
      fs.mkdirSync(path.join(rootAbs, d), { recursive: true });
    }
  } catch (e) {
    console.error("[uploads] ensureUploadRoot error:", e);
  }
};

// base url yang benar (https + host)
function baseUrl(req) {
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  return `${req.protocol}://${req.get("host")}`;
}

// ubah absolute path filesystem -> relative URL /uploads/...
function fileToPublicPath(absOrRelPath) {
  if (!absOrRelPath) return null;

  // normalisasi slash
  const p = String(absOrRelPath).replace(/\\/g, "/");

  // kasus multer memberikan absolute path (misal /mine/.../backend/uploads/logos/a.png)
  const idx = p.lastIndexOf("/uploads/");
  if (idx >= 0) return p.slice(idx); // "/uploads/logos/a.png"

  // kasus multer memberikan relative path "uploads/logos/a.png"
  if (p.startsWith("uploads/")) return `/${p}`; // "/uploads/logos/a.png"

  // fallback aman
  if (p.startsWith("/uploads/")) return p;
  return null;
}

exports.afterSingle = (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ message: "No file uploaded" });

  const publicPath = fileToPublicPath(f.path);
  if (!publicPath) {
    return res.status(500).json({ message: "Failed to build public file path" });
  }

  const url = `${baseUrl(req)}${publicPath}`;
  return res.status(201).json({ url, path: publicPath });
};

exports.afterMultiple = (req, res) => {
  const files = req.files || [];
  const out = files
    .map((f) => {
      const publicPath = fileToPublicPath(f.path);
      if (!publicPath) return null;
      return { url: `${baseUrl(req)}${publicPath}`, path: publicPath };
    })
    .filter(Boolean);

  return res.status(201).json({ files: out });
};
