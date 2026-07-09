// backend/src/routes/auth.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const otp = require('../controllers/otp.controller');
const { authRequired } = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', authRequired, ctrl.me);
router.post('/mitra/register', ctrl.registerMitra);
router.post('/send-otp', otp.send);
router.post('/verify-otp', otp.verify);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/logout', ctrl.logout);

module.exports = router;