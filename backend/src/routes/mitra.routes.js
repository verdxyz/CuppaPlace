// backend/src/routes/mitra.routes.js
const express = require("express");
const router = express.Router();

const { registerMitra, getMitraDashboard } = require("../controllers/mitra.controller");
const { authRequired } = require("../middlewares/auth");
const { uploadCafeMedia } = require("../middlewares/uploadCafeMedia");

// Register mitra SEKALI JALAN (multipart/form-data)
// field: logo, cover (optional)
router.post(
  "/register",
  uploadCafeMedia.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
  ]),
  registerMitra
);

router.get("/dashboard", authRequired, getMitraDashboard);

module.exports = router;
