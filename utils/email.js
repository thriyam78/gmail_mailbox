const nodemailer = require("nodemailer");
const { options } = require("../app");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    //nodemailer for sending email to the user
    service: "gmail",
    port: 465,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const emailOptions = {
    from: "mailtothriyam@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  await transporter.sendMail(emailOptions);
};

module.exports = { sendEmail };
