import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, text) => {
  
  try {
    const transport = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.AUTH_USER,
        pass: process.env.PASS,
      },
    });

    await transport.sendMail({
      from: `"Vocaba<Robot>" ${process.env.AUTH_USER}`,
      to: email,
      subject: subject,
      text: text,
    });
    
    console.log("email sent successfully");
  } catch (error) {
    console.log("email not sent!");
    console.log(error);
    return error;
  }
};