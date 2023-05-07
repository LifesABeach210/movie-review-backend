const nodemailer = require("nodemailer");

const generateMailTransporter = function () {
  const results = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "898e35f55f229c",
      pass: "08b128f496ae9c",
    },
  });

  return results;
};

module.exports = { generateMailTransporter };
