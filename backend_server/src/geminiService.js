let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch (e) {
  // Graceful fallback if @google/generative-ai is pending install
  GoogleGenerativeAI = null;
}

const getApiKey = () => process.env.GEMINI_API_KEY;

/**
 * Generate AI content using Google Gemini
 * @param {string} prompt - Prompt or question for the AI
 * @param {string} [context] - Optional clinical or patient context
 * @returns {Promise<string>} - The generated AI response text
 */
const generateGeminiResponse = async (prompt, context = "") => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in backend environment variables.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  // Combine system context with prompt if provided
  let fullPrompt = "";
  if (context && context.trim()) {
    fullPrompt = `You are a clinical AI assistant for CentriCare Electronic Medical Record (EMR) system. Assist healthcare professionals with documentation, clinical summarization, and medical information inquiry while maintaining professional medical accuracy.\n\nContext:\n${context.trim()}\n\nRequest:\n${prompt.trim()}`;
  } else {
    fullPrompt = `You are a clinical AI assistant for CentriCare Electronic Medical Record (EMR) system. Assist healthcare professionals with documentation, clinical summarization, and medical information inquiry.\n\nRequest:\n${prompt.trim()}`;
  }

  // Use official SDK if available
  if (GoogleGenerativeAI) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  // Fallback to official REST endpoint if SDK package has not been installed yet
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response returned from Gemini API");
  }

  return text;
};

module.exports = {
  generateGeminiResponse,
};
