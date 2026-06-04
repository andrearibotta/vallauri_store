const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, text) => {
    try {
        await resend.emails.send({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
            text
        });
        return { success: true };
    } catch (err) {
        console.error("Errore invio mail", err);
        return { success: false, error: err.message };
    }
}

module.exports = { sendEmail };
