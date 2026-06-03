const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false  // ✅ ignora errori certificato
    }
});

const sendEmail = async(to, subject, html, text) => {
    try {
        const mailOption = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
            text
        }
        const info = await transporter.sendMail(mailOption);
        return { success: true };          // ✅ successo nel try
    } catch (err) {
        console.error("Errore invio mail", err);
        return { success: false, error: err.message };  // ✅ errore nel catch
    }
}

module.exports = {sendEmail};