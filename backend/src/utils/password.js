// backend/src/utils/password.js
const bcrypt = require('bcryptjs');

const ROUNDS = 10;

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(plain, salt);
}
async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}
async function hashOtp(plain) {
  return bcrypt.hash(String(plain), ROUNDS);
}
async function compareOtp(plain, hash) {
  return bcrypt.compare(String(plain), hash);
}

module.exports = { hashPassword, comparePassword, hashOtp, compareOtp };