const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/users.controller');

router.get('/me/cafes', authRequired, ctrl.myCafes);

module.exports = router;