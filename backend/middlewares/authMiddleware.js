const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
}

module.exports = { authMiddleware, signToken, JWT_SECRET };
