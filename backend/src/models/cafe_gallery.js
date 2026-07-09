const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CafeGallery = sequelize.define(
    "CafeGallery",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      cafe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      image_url: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: "cafe_galleries",
      timestamps: true,
      underscored: true,
    }
  );

  return CafeGallery;
};
