import { BASE_URL, getAuthHeaders, handleApiResponse } from "./global";

export const patientApi = {
  bookAppointment: async (appointmentData) => {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
    return handleApiResponse(res);
  },

  getMyAppointments: async () => {
    const res = await fetch(`${BASE_URL}/appointments/my`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  getMyRecords: async (patientId) => {
    const res = await fetch(`${BASE_URL}/medical-records/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },
};

export default patientApi;
