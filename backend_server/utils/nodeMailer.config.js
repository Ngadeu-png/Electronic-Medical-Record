const nodemailer = require("nodemailer");

const SENDMAIL = async (msg, callback) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "emedrecord39@gmail.com",
      pass: "bcpg fndc xlhs ncev",
    },
  });

  const message = {
    from: "emedrecord39@gmail.com",
    to: msg.to,
    subject: msg.subject,
    attachments: msg.attachments || [],
  };

  if (typeof msg.content === "string") {
    if (msg.html) {
      message.html = msg.content;
    } else {
      message.text = msg.content;
    }
  } else {
    console.error("msg.content must be a string");
    return;
  }

  try {
    const info = await transporter.sendMail(message);
    callback(info);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = SENDMAIL;
