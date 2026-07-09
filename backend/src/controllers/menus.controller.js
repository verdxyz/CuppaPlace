const { Menu, Cafe } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const { cafe_id, name, category, price, description, photo_url, is_available } = req.body || {};
    if (!cafe_id || !name || !price) return res.status(400).json({ message: 'cafe_id, name, price required' });
    const cafe = await Cafe.findByPk(cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    if (req.user.role !== 'admin' && cafe.owner_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const row = await Menu.create({ cafe_id, name, category, price, description, photo_url, is_available });
    res.status(201).json(row);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const row = await Menu.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Menu not found' });
    const cafe = await Cafe.findByPk(row.cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    if (req.user.role !== 'admin' && cafe.owner_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const allowed = ['name','category','price','description','photo_url','is_available'];
    for (const k of allowed) if (req.body[k] !== undefined) row[k] = req.body[k];
    await row.save();
    res.json(row);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const row = await Menu.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Menu not found' });
    const cafe = await Cafe.findByPk(row.cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    if (req.user.role !== 'admin' && cafe.owner_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await row.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
};