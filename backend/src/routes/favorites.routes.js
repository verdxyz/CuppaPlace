const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/favorites.controller');

// Full path when mounted with /api/users:
//   GET    /api/users/me/favorites
//   POST   /api/users/me/favorites/:cafeId
//   DELETE /api/users/me/favorites/:cafeId
router.get('/me/favorites', authRequired, ctrl.listMine);
router.post('/me/favorites/:cafeId', authRequired, ctrl.add);
router.delete('/me/favorites/:cafeId', authRequired, ctrl.remove);

module.exports = router;
