const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// SEND PAYMENT REMINDER EMAIL
const sendPaymentReminderEmail = async ({
    to,
    subject,
    message
}) => {
    try {
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            text: message
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return result.data;

    } catch (error) {
        console.error(
            "Resend Email Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    sendPaymentReminderEmail
};