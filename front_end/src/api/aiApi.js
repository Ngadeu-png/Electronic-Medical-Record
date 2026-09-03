import { BASE_URL, getAuthHeaders, handleApiResponse } from "./global";

/**
 * Send a prompt and target selections to the backend AI endpoint.
 *
 * @param {string} prompt - Question or request for the AI
 * @param {object} [options] - Target options { targetPatientId, targetRecordId, targetDoctorId, customContext }
 * @returns {Promise<{ success: boolean, response: string, chat: object }>}
 */
export const askAiAssistant = async (prompt, options = {}) => {
  const res = await fetch(`${BASE_URL}/ai/ask`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      prompt,
      targetPatientId: options.targetPatientId || undefined,
      targetRecordId: options.targetRecordId || undefined,
      targetDoctorId: options.targetDoctorId || undefined,
      customContext: options.customContext || undefined,
    }),
  });
  return handleApiResponse(res);
};

/**
 * Fetch persistent conversation history for the current authenticated user
 */
export const fetchAiHistory = async () => {
  const res = await fetch(`${BASE_URL}/ai/history`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(res);
};

/**
 * Clear stored conversation history for the current user
 */
export const deleteAiHistory = async () => {
  const res = await fetch(`${BASE_URL}/ai/history`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleApiResponse(res);
};

/**
 * Fetch available target options for context selection (patients, records, doctors)
 */
export const fetchContextOptions = async () => {
  const res = await fetch(`${BASE_URL}/ai/context-options`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(res);
};
