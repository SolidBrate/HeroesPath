const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const sendCode = require("../utils/mail");
require("dotenv").config();

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await pool.query(
      "INSERT INTO users(email,password_hash,verify_code) VALUES($1,$2,$3)",
      [email, hash, code]
    );

    await sendCode(email, code);

    res.json({ status: "ok" });
} catch (err) {
  console.error(err); // Это покажет ошибку в черном окне консоли
  res.status(500).json({ error: err.message }); 
}
});

// Подтверждение
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND verify_code=$2",
    [email, code]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ error: "Неверный код" });

  await pool.query(
    "UPDATE users SET is_verified=TRUE, verify_code=NULL WHERE email=$1",
    [email]
  );

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND is_verified=TRUE",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ error: "Пользователь не найден" });

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(400).json({ error: "Неверный пароль" });

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

module.exports = router;
