// backend/src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES || process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  // token cukup minimal (id/role/email)
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function authRequired(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const m = h.match(/^Bearer\s+(.+)/i);
    if (!m) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(m[1], JWT_SECRET);

    // ✅ ambil name dari DB biar pasti ada
    const user = await User.findByPk(payload.id, {
      attributes: ["id", "name", "role", "email"],
    });

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // ✅ sertakan name
    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { signToken, authRequired, roleRequired };
