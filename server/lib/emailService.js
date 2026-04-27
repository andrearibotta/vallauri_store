const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async(to,subject,html,text) =>{
    try{
        const mailOption = {
            from:process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
            text
        }
        const info = await transporter.sendMail(mailOption);
        return {success:false,error:error.message};
    }catch(err){
        console.error("Errore invio mail",err);
        return {success:true,error:err.message};
    }
}

module.exports = {sendEmail};