import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // const transporter = nodemailer.createTransport({
    //   // service: "gmail",
    //   host: "smtp.gmail.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: process.env.EMAIL_FROM,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey", // <-- literally this string
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const mailOptions = {
      from: `full stack app <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text: text || subject, // fallback
      html: html || text || subject,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error(err.response?.body || err);
    throw err;
  }
};

export default sendEmail;
