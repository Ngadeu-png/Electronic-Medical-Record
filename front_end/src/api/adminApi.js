import { BASE_URL, getAuthHeaders, handleApiResponse } from "./global";

export const adminApi = {
  getStatistics: async () => {
    const res = await fetch(`${BASE_URL}/admin/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  getAllAppointments: async (status) => {
    const url = status
      ? `${BASE_URL}/admin/appointments?status=${status}`
      : `${BASE_URL}/admin/appointments`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleApiResponse(res);
  },

  getPendingAppointments: async () => {
    const res = await fetch(`${BASE_URL}/admin/appointments/pending`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  assignDoctor: async (appointmentId, doctorId) => {
    const res = await fetch(`${BASE_URL}/admin/appointments/${appointmentId}/assign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ doctorId }),
    });
    return handleApiResponse(res);
  },

  unassignDoctor: async (appointmentId) => {
    const res = await fetch(`${BASE_URL}/admin/appointments/${appointmentId}/unassign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },
};

export default adminApi;
