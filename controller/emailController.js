const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");


const sendEmail = asyncHandler(async (data, req, res) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth:{
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: data.email,
        subject: data.subject,
        text: data.text,
        html: data.html,
    });
});



module.exports = sendEmail;