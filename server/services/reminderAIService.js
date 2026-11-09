const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// GENERATE PERSONALIZED PAYMENT REMINDER
const generatePaymentReminder = async (invoice) => {
    try {
        const prompt = `
You are PayPilot AI, a professional business
communication assistant.

Write a polite and professional payment reminder
email for the following overdue invoice.

INVOICE DETAILS:

Customer Name: ${invoice.customerName}
Customer Email: ${invoice.customerEmail}
Invoice Number: ${invoice.invoiceNumber}
Description: ${invoice.description}
Original Amount: ${invoice.amount} ${invoice.currency}
Late Payment Fee: ${invoice.lateFeeAmount || 0} ${invoice.currency}
Total Outstanding: ${
    invoice.totalOutstanding ||
    invoice.amount + (invoice.lateFeeAmount || 0)
} ${invoice.currency}
Due Date: ${new Date(invoice.dueDate).toDateString()}

INSTRUCTIONS:

1. Address the customer by their name.
2. Mention the invoice number.
3. 3. Clearly mention the original invoice amount, late payment fee, total outstanding amount, and due date.
4. Politely request payment.
5. Keep the tone friendly and professional.
6. Do not threaten or pressure the customer.
7. Do not invent payment links or payment details.
8. Include a suitable email subject.
9. Keep the email concise.

Return the result in this exact JSON format:

{
  "subject": "Payment reminder for invoice",
  "message": "Dear customer..."
}

Return ONLY valid JSON without Markdown code blocks.
`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
            contents: prompt
        });

        const responseText = response.text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const reminder = JSON.parse(responseText);

        if (
            typeof reminder.subject !== "string" ||
            typeof reminder.message !== "string" ||
            !reminder.subject.trim() ||
            !reminder.message.trim()
        ) {
            throw new Error("Invalid reminder response from Gemini.");
        }

        return reminder;

    } catch (error) {
        console.error(
            "Payment Reminder AI Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    generatePaymentReminder
};