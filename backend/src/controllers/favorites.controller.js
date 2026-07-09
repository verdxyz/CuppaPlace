const { Favorite, Cafe } = require('../models');

exports.listMine = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const rows = await Favorite.findAll({
      where: { user_id: userId },
      include: [{ model: Cafe, as: 'cafe' }],
      order: [['id', 'DESC']],
    });

    res.json(rows.map((r) => ({
      id: r.id,
      cafe: r.cafe,
    })));
  } catch (e) {
    next(e);
  }
};

exports.add = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cafeId = Number(req.params.cafeId);
    if (!cafeId) return res.status(400).json({ message: 'cafeId invalid' });

    const [fav] = await Favorite.findOrCreate({
      where: { user_id: userId, cafe_id: cafeId },
    });

    res.status(201).json({ id: fav.id, cafe_id: cafeId });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cafeId = Number(req.params.cafeId);
    if (!cafeId) return res.status(400).json({ message: 'cafeId invalid' });

    await Favorite.destroy({ where: { user_id: userId, cafe_id: cafeId } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
