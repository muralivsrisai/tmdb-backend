const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text, html }) => {
  return sgMail.send({
    to,
    from: {
      email: process.env.EMAIL_USER,
      name: 'Gledati Support'
    },
    subject,
    text,
    html
  });
};

module.exports = { sendMail };
