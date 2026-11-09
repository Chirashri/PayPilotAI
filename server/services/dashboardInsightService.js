const { GoogleGenAI } = require("@google/genai");
const { getFinancialSummary } = require("./financialService");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateDashboardInsights = async () => {
    try {
        const financialData = await getFinancialSummary();

        const prompt = `
You are PayPilot AI, a professional financial analyst
for freelancers and small businesses.

Analyze the following actual financial data:

${JSON.stringify(financialData, null, 2)}

Generate exactly 3 useful financial insights.

Rules:
1. Use only the supplied financial data.
2. Never invent financial figures.
3. Highlight revenue and payment performance.
4. Identify pending or overdue payment opportunities.
5. Give practical recommendations.
6. If there is insufficient data, explain that clearly.
7. Do not repeat the same insight.
8. Keep each insight concise and easy to understand.

Return ONLY valid JSON in this format:

{
  "insights": [
    {
      "title": "Short insight title",
      "description": "One or two sentence explanation",
      "type": "revenue"
    },
    {
      "title": "Short insight title",
      "description": "One or two sentence explanation",
      "type": "warning"
    },
    {
      "title": "Short insight title",
      "description": "One or two sentence explanation",
      "type": "success"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
            contents: prompt
        });

        const responseText = response.text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsedResponse = JSON.parse(responseText);

        if (
            !Array.isArray(parsedResponse.insights) ||
            parsedResponse.insights.length !== 3
        ) {
            throw new Error("Invalid Gemini insights response.");
        }

        return parsedResponse.insights;

    } catch (error) {
        console.error(
            "Dashboard Insights Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    generateDashboardInsights
};