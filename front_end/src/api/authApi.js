import { BASE_URL, handleApiResponse } from "./global";

export const authApi = {
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auths/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleApiResponse(res);
  },

  signup: async (userData) => {
    const res = await fetch(`${BASE_URL}/auths/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleApiResponse(res);
  },

  resetPassword: async (data) => {
    const res = await fetch(`${BASE_URL}/auths/resetpassword`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleApiResponse(res);
  },
};

export default authApi;
