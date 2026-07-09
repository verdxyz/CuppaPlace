const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Favorite = sequelize.define('Favorite', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    cafe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  }, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'cafe_id'] },
    ],
  });

  return Favorite;
};
