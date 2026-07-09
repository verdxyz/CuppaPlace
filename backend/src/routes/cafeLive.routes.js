// backend/src/routes/cafeLive.routes.js
const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/cafeLive.controller");
const { authRequired } = require("../middlewares/auth");

// public
router.get("/cafes/:id/live", ctrl.getLiveFeed);

// protected
router.post("/cafes/:id/live", authRequired, ctrl.createLivePost);
router.post("/live/:postId/react", authRequired, ctrl.reactLivePost);

module.exports = router;
