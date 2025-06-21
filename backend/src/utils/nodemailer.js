const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host:"smtp-relay.brevo.com",
  port: 587,
  service: 'Gmail',// or your SMTP provider
  auth: {
    user: process.env.SENDER_EMAIL, // your Gmail address
    pass: process.env.SENDER_PASS  // the 16-character app password
  },
  tls: {
    rejectUnauthorized: false, // 👈 This disables certificate verification
  },
});

module.exports = transporter;