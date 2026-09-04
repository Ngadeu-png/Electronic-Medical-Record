import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import patientApi from "../../api/patientApi";

// Admin: fetch all registered patients
export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch patients");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Personal Profile
export const fetchMyProfile = createAsyncThunk(
  "patients/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await patientApi.getMyProfile();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  "patients/updateMyProfile",
  async (userData, { rejectWithValue }) => {
    try {
      return await patientApi.updateMyProfile(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Emergency Medical Profile
export const fetchEmergencyProfile = createAsyncThunk(
  "patients/fetchEmergencyProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await patientApi.getEmergencyProfile();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEmergencyProfile = createAsyncThunk(
  "patients/updateEmergencyProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      return await patientApi.updateEmergencyProfile(profileData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Emergency Contacts / Trusted Persons
export const fetchEmergencyContacts = createAsyncThunk(
  "patients/fetchEmergencyContacts",
  async (_, { rejectWithValue }) => {
    try {
      return await patientApi.getEmergencyContacts();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addEmergencyContact = createAsyncThunk(
  "patients/addEmergencyContact",
  async (contactData, { rejectWithValue }) => {
    try {
      return await patientApi.addEmergencyContact(contactData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEmergencyContact = createAsyncThunk(
  "patients/updateEmergencyContact",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await patientApi.updateEmergencyContact(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEmergencyContact = createAsyncThunk(
  "patients/deleteEmergencyContact",
  async (id, { rejectWithValue }) => {
    try {
      await patientApi.deleteEmergencyContact(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Privacy-aware search for registered users
export const searchRegisteredUsers = createAsyncThunk(
  "patients/searchRegisteredUsers",
  async (query, { rejectWithValue }) => {
    try {
      return await patientApi.searchRegisteredUsers(query);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// People Who Have Trusted You
export const fetchTrustedPatients = createAsyncThunk(
  "patients/fetchTrustedPatients",
  async (_, { rejectWithValue }) => {
    try {
      return await patientApi.getTrustedPatients();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Emergency access audit logs
export const fetchPatientEmergencyAccessLogs = createAsyncThunk(
  "patients/fetchPatientEmergencyAccessLogs",
  async (patientId, { rejectWithValue }) => {
    try {
      return await patientApi.getEmergencyAccessLogs(patientId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor/hospital emergency profile view
export const doctorFetchEmergencyProfile = createAsyncThunk(
  "patients/doctorFetchEmergencyProfile",
  async ({ patientId, reason }, { rejectWithValue }) => {
    try {
      return await patientApi.getPatientEmergencyProfile(patientId, reason);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,

  // Personal profile
  profile: null,
  profileStatus: "idle",

  // Emergency medical profile
  emergencyProfile: null,
  emergencyStatus: "idle",

  // Emergency contacts
  emergencyContacts: [],
  contactsStatus: "idle",

  // User search results
  userSearchResults: [],
  searchStatus: "idle",

  // Patients who have trusted the logged-in user
  trustedPatients: [],
  trustedStatus: "idle",

  // Emergency access logs
  accessLogs: [],
  logsStatus: "idle",

  // Doctor emergency lookup
  doctorEmergencyPatient: null,
  doctorEmergencyStatus: "idle",

  // Action status / feedback
  actionStatus: "idle",
  actionMessage: null,
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearPatientActionMessage: (state) => {
      state.actionMessage = null;
      state.error = null;
      state.actionStatus = "idle";
    },
    clearSearchResults: (state) => {
      state.userSearchResults = [];
    },
    clearDoctorEmergencyPatient: (state) => {
      state.doctorEmergencyPatient = null;
      state.doctorEmergencyStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPatients (Admin list)
      .addCase(fetchPatients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error fetching patients";
      })

      // fetchMyProfile
      .addCase(fetchMyProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload.user;
        if (action.payload.emergencyProfile) {
          state.emergencyProfile = action.payload.emergencyProfile;
        }
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })

      // updateMyProfile
      .addCase(updateMyProfile.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.profile = action.payload.user;
        state.actionMessage = "Profile updated successfully!";
        // Also update stored user in localStorage
        try {
          const current = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({ ...current, ...action.payload.user })
          );
        } catch (e) {}
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // fetchEmergencyProfile
      .addCase(fetchEmergencyProfile.pending, (state) => {
        state.emergencyStatus = "loading";
      })
      .addCase(fetchEmergencyProfile.fulfilled, (state, action) => {
        state.emergencyStatus = "succeeded";
        state.emergencyProfile = action.payload;
      })
      .addCase(fetchEmergencyProfile.rejected, (state, action) => {
        state.emergencyStatus = "failed";
        state.error = action.payload;
      })

      // updateEmergencyProfile
      .addCase(updateEmergencyProfile.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(updateEmergencyProfile.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.emergencyProfile = action.payload.profile;
        state.actionMessage = "Emergency medical profile saved successfully!";
      })
      .addCase(updateEmergencyProfile.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // fetchEmergencyContacts
      .addCase(fetchEmergencyContacts.pending, (state) => {
        state.contactsStatus = "loading";
      })
      .addCase(fetchEmergencyContacts.fulfilled, (state, action) => {
        state.contactsStatus = "succeeded";
        state.emergencyContacts = action.payload;
      })
      .addCase(fetchEmergencyContacts.rejected, (state, action) => {
        state.contactsStatus = "failed";
        state.error = action.payload;
      })

      // addEmergencyContact
      .addCase(addEmergencyContact.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(addEmergencyContact.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.emergencyContacts.unshift(action.payload.contact);
        state.actionMessage = "Emergency contact added successfully!";
      })
      .addCase(addEmergencyContact.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // updateEmergencyContact
      .addCase(updateEmergencyContact.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const idx = state.emergencyContacts.findIndex(
          (c) => c._id === action.payload.contact._id
        );
        if (idx !== -1) {
          state.emergencyContacts[idx] = action.payload.contact;
        }
        state.actionMessage = "Emergency contact updated successfully!";
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // deleteEmergencyContact
      .addCase(deleteEmergencyContact.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.emergencyContacts = state.emergencyContacts.filter(
          (c) => c._id !== action.payload
        );
        state.actionMessage = "Emergency contact removed successfully!";
      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // searchRegisteredUsers
      .addCase(searchRegisteredUsers.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchRegisteredUsers.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.userSearchResults = action.payload;
      })
      .addCase(searchRegisteredUsers.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.payload;
      })

      // fetchTrustedPatients
      .addCase(fetchTrustedPatients.pending, (state) => {
        state.trustedStatus = "loading";
      })
      .addCase(fetchTrustedPatients.fulfilled, (state, action) => {
        state.trustedStatus = "succeeded";
        state.trustedPatients = action.payload;
      })
      .addCase(fetchTrustedPatients.rejected, (state, action) => {
        state.trustedStatus = "failed";
        state.error = action.payload;
      })

      // fetchPatientEmergencyAccessLogs
      .addCase(fetchPatientEmergencyAccessLogs.pending, (state) => {
        state.logsStatus = "loading";
      })
      .addCase(fetchPatientEmergencyAccessLogs.fulfilled, (state, action) => {
        state.logsStatus = "succeeded";
        state.accessLogs = action.payload;
      })
      .addCase(fetchPatientEmergencyAccessLogs.rejected, (state, action) => {
        state.logsStatus = "failed";
        state.error = action.payload;
      })

      // doctorFetchEmergencyProfile
      .addCase(doctorFetchEmergencyProfile.pending, (state) => {
        state.doctorEmergencyStatus = "loading";
      })
      .addCase(doctorFetchEmergencyProfile.fulfilled, (state, action) => {
        state.doctorEmergencyStatus = "succeeded";
        state.doctorEmergencyPatient = action.payload;
      })
      .addCase(doctorFetchEmergencyProfile.rejected, (state, action) => {
        state.doctorEmergencyStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearPatientActionMessage,
  clearSearchResults,
  clearDoctorEmergencyPatient,
} = patientSlice.actions;

export default patientSlice.reducer;