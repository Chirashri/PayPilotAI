
const {
    testGeminiConnection
} = require("../services/geminiService");

const {
    getFinancialSummary
} = require("../services/financialService");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// RETRY GEMINI WHEN THE SERVICE IS TEMPORARILY UNAVAILABLE
const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (prompt) => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await ai.models.generateContent({
                model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
                contents: prompt
            });

        } catch (error) {
            const status = Number(
                error.status ??
                error.statusCode ??
                error.response?.status ??
                error.error?.code ??
                error.code
            );

            const shouldRetry = [500, 503].includes(status);

            if (!shouldRetry || attempt === maxAttempts) {
                throw error;
            }

            const delay = 2000 * Math.pow(2, attempt - 1);

            console.log(
                `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxAttempts} in ${delay / 1000} seconds.`
            );

            await sleep(delay);
        }
    }
};

// TEST GEMINI CONNECTION
const testAI = async (req, res) => {
    try {
        const response = await testGeminiConnection();

        res.status(200).json({
            success: true,
            message: "Gemini API connected successfully!",
            reply: response
        });

    } catch (error) {
        console.error("Gemini Connection Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Gemini API connection failed."
        });
    }
};

// CONVERSATIONAL FINANCIAL AI
const askFinancialAI = async (req, res) => {
    try {
        const { question, history = [] } = req.body;

        // VALIDATE QUESTION
        if (
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid question."
            });
        }

        if (question.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Question must be under 1000 characters."
            });
        }

        // VALIDATE CONVERSATION HISTORY
        if (!Array.isArray(history)) {
            return res.status(400).json({
                success: false,
                message: "Conversation history must be an array."
            });
        }

        if (history.length > 20) {
            return res.status(400).json({
                success: false,
                message: "Only the latest 20 messages can be included."
            });
        }

        const validHistory = history.every(message =>
            message &&
            ["user", "assistant"].includes(message.role) &&
            typeof message.content === "string" &&
            message.content.length <= 4000
        );

        if (!validHistory) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation history."
            });
        }

        // GET CURRENT FINANCIAL DATA
        const financialData = await getFinancialSummary();

        // PREPARE PREVIOUS CONVERSATION
        const conversationHistory = history.map(message => ({
            role: message.role === "assistant"
                ? "PayPilot AI"
                : "User",
            message: message.content
        }));

        // BUILD CONVERSATIONAL PROMPT
        const prompt = `
You are PayPilot AI, an intelligent and friendly
AI assistant for freelancers and small businesses.

You are a general conversational assistant with
special expertise in financial management.

YOUR CAPABILITIES:

1. Answer general questions and have natural conversations.
2. Respond to greetings and everyday questions.
3. Help users understand invoices and payments.
4. Analyse business financial performance.
5. Explain financial calculations.
6. Provide useful financial suggestions when appropriate.
7. Understand previous messages and follow-up questions.

FINANCIAL DATA RULES:

1. Use the provided financial records for questions
   about the user's actual finances.
2. Never invent revenue, payment or invoice figures.
3. If financial information is unavailable, say so.
4. Clearly distinguish actual records from examples.
5. Do not claim to have executed payments or changed invoices.
6. Do not assume access to financial information
   that is not included in the supplied data.

CONVERSATION RULES:

1. Remember and understand the conversation history below.
2. Use previous messages to understand follow-up questions.
3. If the user says "they", "that", "it" or "the other one",
   use the conversation context to understand the reference.
4. Avoid repeating the same introduction in every response.
5. Be friendly, natural and conversational.
6. Keep answers clear and useful.
7. Do not force every general conversation into a financial topic.
8. If the user asks something unrelated to finance,
   answer it normally when possible.

CURRENT FINANCIAL DATA:
${JSON.stringify(financialData, null, 2)}

PREVIOUS CONVERSATION:
${JSON.stringify(conversationHistory, null, 2)}

LATEST USER QUESTION:
${question}

Respond naturally as PayPilot AI.
`;

        // GENERATE GEMINI RESPONSE WITH AUTOMATIC RETRIES
        const response = await generateWithRetry(prompt);

        res.status(200).json({
            success: true,
            question,
            answer: response.text
        });

    } catch (error) {
        console.error("Financial AI Error:", error.message);

        const status = Number(
            error.status ??
            error.statusCode ??
            error.response?.status ??
            error.error?.code ??
            error.code
        );

       if (status === 429) {
    return res.status(429).json({
        success: false,
        message: "Gemini daily quota has been reached. Please try again after the quota resets."
    });
}

if (status === 503) {
    return res.status(503).json({
        success: false,
        message: "Gemini is temporarily unavailable. Please try again shortly."
    });
}

return res.status(500).json({
    success: false,
    message: "Unable to process your question right now."
});
    }
};

module.exports = {
    testAI,
    askFinancialAI
};
