const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
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
    text,
    html
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendMail };