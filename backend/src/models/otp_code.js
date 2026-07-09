// src/models/otp_code.js

module.exports = (sequelize, DataTypes) => {
  const OTPCode = sequelize.define('OTPCode', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(160), allowNull: false },
    code: { type: DataTypes.STRING(10), allowNull: false }, // simpan HASH di kolom 'code'
    kind: {
      type: DataTypes.ENUM('register', 'login', 'reset'),
      allowNull: false,
      defaultValue: 'register',
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'otp_codes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email', 'kind'] },
      { fields: ['expires_at'] },
    ],
  });

  return OTPCode;
};
