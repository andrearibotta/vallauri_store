const { testConnection } = require('../db/mysql');
const {sendEmail} = require('../lib/emailService');

const sendContantEmail = async (req, res) => {
    try {
        const { name, email, subject ,htmlMessage } = req.body;

        if (!name || !email ) {
            return res.status(400).json({
                error: "Nome, email e messaggio sono obbligatori"
            });
        }
        const emailSubject = subject

        const html = htmlMessage;
        const result = await sendEmail(
            email,
            emailSubject,
            html,
        );

        if (result.success) {
            res.json({ success: true, message: "Email inviata con successo" });
        } else {
            res.status(500).json({ error: "Errore nell'invio dell'email" });
        }
    } catch (error) {
        console.error("Errore controller email:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
};

const sendCustomEmail = async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject) {
            return res.status(400).json({
                error: "Destinatario e oggetto sono obbligatori"
            });
        }

        const result = await sendEmail(to, subject, html, text);

        if (result.success) {
            res.json({ success: true, message: "Email inviata con successo" });
        } else {
            res.status(500).json({ error: "Errore nell'invio dell'email" });
        }
    } catch (error) {
        console.error("Errore controller email custom:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
};

module.exports = { sendContantEmail, sendCustomEmail };