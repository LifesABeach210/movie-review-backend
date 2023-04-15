const nodemailer = require('nodemailer');

const generateMailTransporter = function () {
  const results =  nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "9e8ad661db52d2",
          pass: "b44a0e7a43081d",
        },

    })

    return results;
};

module.exports={generateMailTransporter}