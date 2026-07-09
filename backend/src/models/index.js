// backend/src/models/index.js
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const DB_DIALECT = process.env.DB_DIALECT || "mysql";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "cuppa";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
  timezone: "+07:00",
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

const basename = path.basename(__filename);

// auto-load semua model .js dalam folder ini
fs.readdirSync(__dirname)
  .filter((file) => file.endsWith(".js") && file !== basename)
  .forEach((file) => {
    const modelFactory = require(path.join(__dirname, file));
    const model = modelFactory(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// ambil model yang dibutuhkan (kalau belum ada, nilainya undefined tapi aman)
const { User, Cafe, Menu, Review, Favorite, CafeGallery } = db;

// ===== Alias agar controller bisa pakai { OtpCode } atau { OTPCode } =====
if (db.OTPCode && !db.OtpCode) {
  db.OtpCode = db.OTPCode;
}
if (db.OtpCode && !db.OTPCode) {
  db.OTPCode = db.OtpCode;
}

// ====== Associations lama (tetap) ======
if (User && Cafe) {
  User.hasMany(Cafe, { foreignKey: "owner_id", as: "ownedCafes" });
  Cafe.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
}

if (Cafe && Menu) {
  Cafe.hasMany(Menu, { foreignKey: "cafe_id", as: "menus" });
  Menu.belongsTo(Cafe, { foreignKey: "cafe_id", as: "cafe" });
}

if (Cafe && Review) {
  Cafe.hasMany(Review, { foreignKey: "cafe_id", as: "reviews" });
  Review.belongsTo(Cafe, { foreignKey: "cafe_id", as: "cafe" });
}

if (User && Review) {
  User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
  Review.belongsTo(User, { foreignKey: "user_id", as: "author" });
}

if (User && Cafe && Favorite) {
  User.belongsToMany(Cafe, {
    through: Favorite,
    foreignKey: "user_id",
    otherKey: "cafe_id",
    as: "favoriteCafes",
  });

  Cafe.belongsToMany(User, {
    through: Favorite,
    foreignKey: "cafe_id",
    otherKey: "user_id",
    as: "fans",
  });

  Favorite.belongsTo(Cafe, { foreignKey: "cafe_id", as: "cafe" });
  Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

// ✅ NEW: Cafe Galleries
if (Cafe && CafeGallery) {
  Cafe.hasMany(CafeGallery, { foreignKey: "cafe_id", as: "galleries" });
  CafeGallery.belongsTo(Cafe, { foreignKey: "cafe_id", as: "cafe" });
}

module.exports = db;
