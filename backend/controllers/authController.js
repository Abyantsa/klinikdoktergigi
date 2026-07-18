const bcrypt = require("bcryptjs");
const { signToken } = require("../middlewares/authMiddleware");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = signToken({ username, role: "admin" });
      return res.json({ token, username });
    }
    return res.status(401).json({ error: "Username atau password salah" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { login };
