const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    //creating a transporter using nodemailer

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smpt in case of gmail
      auth: {
        user: process.env.MAIL_USER, // email of sender
        pass: process.env.MAIL_PASS, // app password
      },
    });

    let info = await transporter.sendMail({
      from: "Nimble",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;

  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;
