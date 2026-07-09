const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/reviews.controller');

router.get('/cafe/:id', ctrl.listForCafe);
router.post('/cafe/:id', authRequired, ctrl.create);

module.exports = router;