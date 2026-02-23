const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendCode(email, code) {
  await transporter.sendMail({
    from: "Hero Path",
    to: email,
    subject: "Код подтверждения",
    text: "Ваш код: " + code
  });
}

module.exports = sendCode;