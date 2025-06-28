const nodemailer = require("nodemailer");

// ✅ Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chiragshrma14@gmail.com",          // ← apna Gmail
    pass: "zvxalumkpbtxzhaz"             // ← 16-digit App password
  }
});

// ✅ Mail ka content
const mailOptions = {
  from: "chiragshrma14@gmail.com",
  to: "receiver@gmail.com",               // ← jisko bhejna hai
  subject: "Password Reset - MyBlogSpace",
  html: `
    <p>Click the link below to reset your password:</p>
    <a href="http://localhost:3000/reset-password?email=receiver@gmail.com">Reset Password</a>
  `
};

// ✅ Mail send karna
transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log("❌ Error:", err);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});
