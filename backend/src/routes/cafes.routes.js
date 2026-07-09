// backend/src/routes/cafes.routes.js
const router = require("express").Router();

const { authRequired, roleRequired } = require("../middlewares/auth");
const { uploadCafeMedia } = require("../middlewares/uploadCafeMedia");

const ctrl = require("../controllers/cafes.controller");
const reviewCtrl = require("../controllers/reviews.controller");

// ---------- routes existing ----------
router.get("/", ctrl.list);
router.get("/:id", ctrl.detail);
router.get("/:id/menu", ctrl.menu);
router.get("/:id/reviews", reviewCtrl.listForCafe);
router.post("/:id/reviews", authRequired, reviewCtrl.create);
router.get("/:id/reports", authRequired, ctrl.reports);
router.put("/:id", authRequired, ctrl.update);

// update logo/cover (after register)
router.post(
  "/:id/media",
  authRequired,
  roleRequired("mitra", "admin"),
  uploadCafeMedia.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
  ]),
  ctrl.updateMedia
);

// upload gallery (after register) - multiple files
router.post(
  "/:id/galleries",
  authRequired,
  roleRequired("mitra", "admin"),
  uploadCafeMedia.array("gallery", 8),
  ctrl.addGallery
);

// delete one gallery image
router.delete(
  "/:id/galleries/:galleryId",
  authRequired,
  roleRequired("mitra", "admin"),
  ctrl.deleteGallery
);

module.exports = router;
