import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "../../api/global";

// ── Async Thunks ─────────────────────────────────────────────

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/doctors`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch doctors");
      return data.doctors || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createDoctor = createAsyncThunk(
  "doctors/createDoctor",
  async (doctorData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/doctors`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(doctorData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to add doctor");
      return data.doctor;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDoctor = createAsyncThunk(
  "doctors/updateDoctor",
  async ({ id, doctorData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(doctorData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to update doctor");
      return data.doctor;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  "doctors/deleteDoctor",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete doctor");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────
const initialState = {
  items: [],
  status: "idle",
  actionStatus: "idle",
  error: null,
  successMessage: null,
};

// ── Slice ─────────────────────────────────────────────────────
const doctorSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    clearDoctorMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.actionStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDoctors
      .addCase(fetchDoctors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // createDoctor
      .addCase(createDoctor.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items.push(action.payload);
        state.successMessage = "Doctor added successfully!";
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // updateDoctor
      .addCase(updateDoctor.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = "Doctor updated successfully!";
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // deleteDoctor
      .addCase(deleteDoctor.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.filter((d) => d._id !== action.payload);
        state.successMessage = "Doctor deleted successfully!";
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDoctorMessages } = doctorSlice.actions;
export default doctorSlice.reducer;