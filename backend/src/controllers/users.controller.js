const { User, Cafe } = require('../models');

exports.myCafes = async (req, res, next) => {
  try {
    const rows = await Cafe.findAll({ where: { owner_id: req.user.id }, order: [['id','ASC']] });
    res.json({ data: rows });
  } catch (e) { next(e); }
};