const {sendEmail} = require('../lib/emailService');

const sendContantEmail = async (req, res) => {
    console.log("ciao")
    try {
        const { name, email, message, subject } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                error: "Nome, email e messaggio sono obbligatori"
            });
        }

        const emailSubject = subject || `Nuovo messaggio da ${name}`;
        const html = `
            <h2>Nuovo messaggio di contatto</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Messaggio:</strong></p>
            <p>${message}</p>
        `;
        const text = `Nuovo messaggio di contatto\n\nNome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}`;

        const result = await sendEmail(
            process.env.CONTACT_EMAIL || process.env.SMTP_USER,
            emailSubject,
            html,
            text
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