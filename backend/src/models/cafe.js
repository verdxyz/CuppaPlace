// backend/src/models/cafe.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cafe = sequelize.define('Cafe', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    owner_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(160), allowNull: false },
    address: { type: DataTypes.STRING(255) },
    lat: { type: DataTypes.DECIMAL(10, 7) }, 
    lng: { type: DataTypes.DECIMAL(10, 7) },
    instagram: { type: DataTypes.STRING(160) },
    cover_url: { type: DataTypes.STRING(255) },
    logo_url: { type: DataTypes.STRING(255) },
    opening_hours: { type: DataTypes.JSON }, 
    phone: { type: DataTypes.STRING(30) },
    description: { type: DataTypes.TEXT },
  }, {
    tableName: 'cafes',
    timestamps: true,
    underscored: true,
  });

  return Cafe;
};
