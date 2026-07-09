const { Review, Cafe } = require('../models');

exports.listForCafe = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { rating, limit = 20, offset = 0, status } = req.query;
    const where = { cafe_id };
    if (rating) where.rating = Number(rating);
    if (status) where.status = status;
    const rows = await Review.findAll({ where, limit: Number(limit), offset: Number(offset), order: [['id','DESC']] });
    res.json({ total: rows.length, data: rows });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { rating, text } = req.body || {};
    if (!rating) return res.status(400).json({ message: 'rating required' });
    const cafe = await Cafe.findByPk(cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    const row = await Review.create({
      cafe_id,
      user_id: req.user?.id ?? null,
      rating: Number(rating),
      text: text || null,
      status: 'published',
    });
    res.status(201).json(row);
  } catch (e) { next(e); }
};