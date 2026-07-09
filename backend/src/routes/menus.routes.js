const router = require('express').Router();
const { authRequired, roleRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/menus.controller');

router.post('/', authRequired, roleRequired('mitra','admin'), ctrl.create);
router.put('/:id', authRequired, roleRequired('mitra','admin'), ctrl.update);
router.delete('/:id', authRequired, roleRequired('mitra','admin'), ctrl.remove);

module.exports = router;