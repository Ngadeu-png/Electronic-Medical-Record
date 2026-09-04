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

  // ─────────────────────────────────────────────
  //  Personal Profile & Emergency Medical Profile
  // ─────────────────────────────────────────────
  getMyProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/me`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  updateMyProfile: async (userData) => {
    const res = await fetch(`${BASE_URL}/profile/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleApiResponse(res);
  },

  getEmergencyProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/emergency`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  updateEmergencyProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/profile/emergency`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleApiResponse(res);
  },

  // ─────────────────────────────────────────────
  //  Emergency Contacts / Trusted Persons
  // ─────────────────────────────────────────────
  getEmergencyContacts: async () => {
    const res = await fetch(`${BASE_URL}/profile/emergency-contacts`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  addEmergencyContact: async (contactData) => {
    const res = await fetch(`${BASE_URL}/profile/emergency-contacts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    return handleApiResponse(res);
  },

  updateEmergencyContact: async (id, contactData) => {
    const res = await fetch(`${BASE_URL}/profile/emergency-contacts/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    return handleApiResponse(res);
  },

  deleteEmergencyContact: async (id) => {
    const res = await fetch(`${BASE_URL}/profile/emergency-contacts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  searchRegisteredUsers: async (query) => {
    const res = await fetch(
      `${BASE_URL}/profile/search-users?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(res);
  },

  getTrustedPatients: async () => {
    const res = await fetch(`${BASE_URL}/profile/trusted-patients`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  // ─────────────────────────────────────────────
  //  Clinical Emergency Access & Audit Logs
  // ─────────────────────────────────────────────
  getPatientEmergencyProfile: async (patientId, reason = "") => {
    const res = await fetch(
      `${BASE_URL}/emergency/patient/${patientId}?reason=${encodeURIComponent(reason)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(res);
  },

  searchPatientsForEmergency: async (query) => {
    const res = await fetch(
      `${BASE_URL}/emergency/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(res);
  },

  getEmergencyAccessLogs: async (patientId) => {
    const res = await fetch(`${BASE_URL}/emergency/access-logs/${patientId}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },
};

export default patientApi;
