const { generateGeminiResponse } = require("../geminiService");

/**
 * Handle AI prompt requests
 * POST /api/ai/ask
 */
const handleAiQuery = async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required.",
      });
    }

    const aiResponse = await generateGeminiResponse(prompt, context);

    return res.status(200).json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    // Technical logging on the backend only
    console.error("Gemini API error:", error.message);

    // Safe error message returned to the frontend - never expose API key or environment variables
    return res.status(500).json({
      success: false,
      error: "Unable to process the AI request. Please try again.",
    });
  }
};

module.exports = {
  handleAiQuery,
};
