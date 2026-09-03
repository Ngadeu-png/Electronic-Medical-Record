import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "../../api/global";

// ── Async Thunks ─────────────────────────────────────────────

// Get records for a specific patient
export const fetchPatientRecords = createAsyncThunk(
  "medicalRecords/fetchPatientRecords",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/medical-records/patient/${patientId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch medical records");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Create medical record
export const createMedicalRecord = createAsyncThunk(
  "medicalRecords/createMedicalRecord",
  async (recordData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/medical-records`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(recordData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create medical record");
      return data.record;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Sign medical record
export const signRecord = createAsyncThunk(
  "medicalRecords/signRecord",
  async (recordId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/medical-records/${recordId}/sign`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign record");
      return data.record;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin: Get all records
export const fetchAllRecords = createAsyncThunk(
  "medicalRecords/fetchAllRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/medical-records`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch records");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────
const initialState = {
  records: [],
  allRecords: [],
  status: "idle",
  createStatus: "idle",
  error: null,
  successMessage: null,
};

// ── Slice ─────────────────────────────────────────────────────
const medicalRecordSlice = createSlice({
  name: "medicalRecords",
  initialState,
  reducers: {
    clearRecordMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.createStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPatientRecords
      .addCase(fetchPatientRecords.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPatientRecords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload;
      })
      .addCase(fetchPatientRecords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // createMedicalRecord
      .addCase(createMedicalRecord.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.records.unshift(action.payload);
        state.successMessage = "Medical record created successfully!";
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      // signRecord
      .addCase(signRecord.fulfilled, (state, action) => {
        const index = state.records.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })

      // fetchAllRecords
      .addCase(fetchAllRecords.fulfilled, (state, action) => {
        state.allRecords = action.payload;
      });
  },
});

export const { clearRecordMessages } = medicalRecordSlice.actions;
export default medicalRecordSlice.reducer;
