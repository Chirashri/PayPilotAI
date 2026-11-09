const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const testGeminiConnection = async () => {
    try {
        const model =
            process.env.GEMINI_MODEL || "gemini-3.5-flash";

        console.log("Gemini model being used:", model);

        const response = await ai.models.generateContent({
            model,
            contents: "Reply exactly: PayPilot AI Gemini connection successful!"
        });

        return response.text;

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
};

module.exports = {
    testGeminiConnection
};