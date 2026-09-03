import { BASE_URL, getAuthHeaders, handleApiResponse } from "./global";

/**
 * Send a prompt and optional clinical context to the backend AI endpoint.
 * Notice: The Gemini API Key is never handled or exposed on the client side.
 *
 * @param {string} prompt - Medical query or clinical note completion request
 * @param {string} [context] - Optional patient or clinical context
 * @returns {Promise<{ success: boolean, response: string }>}
 */
export const askAiAssistant = async (prompt, context = "") => {
  const res = await fetch(`${BASE_URL}/ai/ask`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, context }),
  });
  return handleApiResponse(res);
};
