const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or configure SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Gledati Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text, // fallback for clients that don't support HTML
    html  // main HTML content
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
