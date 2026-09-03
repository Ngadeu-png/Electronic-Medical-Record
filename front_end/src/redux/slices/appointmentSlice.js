import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "../../api/global";

// ── Async Thunks ─────────────────────────────────────────────

// Patient: Book appointment
export const bookAppointment = createAsyncThunk(
  "appointments/bookAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book appointment");
      return data.appointment;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Patient: Get own appointments
export const fetchMyAppointments = createAsyncThunk(
  "appointments/fetchMyAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/my`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch appointments");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin: Get all appointments
export const fetchAllAppointments = createAsyncThunk(
  "appointments/fetchAllAppointments",
  async (status, { rejectWithValue }) => {
    try {
      const url = status
        ? `${BASE_URL}/admin/appointments?status=${status}`
        : `${BASE_URL}/admin/appointments`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin: Get pending appointments
export const fetchPendingAppointments = createAsyncThunk(
  "appointments/fetchPendingAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/appointments/pending`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending appointments");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin: Assign doctor to appointment
export const assignDoctor = createAsyncThunk(
  "appointments/assignDoctor",
  async ({ appointmentId, doctorId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/appointments/${appointmentId}/assign`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign doctor");
      return { appointmentId, doctorId, message: data.message, appointment: data.appointment };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin: Unassign doctor from appointment
export const unassignDoctor = createAsyncThunk(
  "appointments/unassignDoctor",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/appointments/${appointmentId}/unassign`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unassign doctor");
      return { appointmentId, message: data.message, appointment: data.appointment };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Get assigned appointments
export const fetchDoctorAppointments = createAsyncThunk(
  "appointments/fetchDoctorAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/assigned-appointments`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch doctor appointments");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Accept assignment
export const acceptAssignment = createAsyncThunk(
  "appointments/acceptAssignment",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/accept`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept assignment");
      return { appointmentId, status: data.status, message: data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Reject assignment
export const rejectAssignment = createAsyncThunk(
  "appointments/rejectAssignment",
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject assignment");
      return { appointmentId, reason, status: data.status, message: data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Redirect to another doctor
export const redirectDoctor = createAsyncThunk(
  "appointments/redirectDoctor",
  async ({ appointmentId, targetDoctorId, reason }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/redirect-doctor`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetDoctorId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to redirect appointment");
      return { appointmentId, targetDoctorId, reason, message: data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Redirect to admin
export const redirectAdmin = createAsyncThunk(
  "appointments/redirectAdmin",
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/redirect-admin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to redirect to admin");
      return { appointmentId, reason, message: data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Doctor: Complete appointment
export const completeAppointment = createAsyncThunk(
  "appointments/completeAppointment",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete appointment");
      return { appointmentId, status: data.status, message: data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────
const initialState = {
  items: [],              // All appointments (admin)
  pendingItems: [],       // Pending appointments (admin)
  myAppointments: [],     // Patient's own appointments
  doctorAppointments: [], // Doctor's assigned appointments
  currentAppointment: null,
  status: "idle",         // 'idle' | 'loading' | 'succeeded' | 'failed'
  actionStatus: "idle",
  error: null,
  successMessage: null,
};

// ── Slice ─────────────────────────────────────────────────────
const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointmentMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.actionStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllAppointments
      .addCase(fetchAllAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchPendingAppointments
      .addCase(fetchPendingAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPendingAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pendingItems = action.payload;
      })
      .addCase(fetchPendingAppointments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchMyAppointments
      .addCase(fetchMyAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myAppointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchDoctorAppointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.doctorAppointments = action.payload;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // bookAppointment
      .addCase(bookAppointment.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.myAppointments.unshift(action.payload);
        state.successMessage = "Appointment booked successfully!";
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // assignDoctor
      .addCase(assignDoctor.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(assignDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Doctor assigned successfully!";
        const index = state.items.findIndex((a) => a._id === action.payload.appointmentId);
        if (index !== -1 && action.payload.appointment) {
          state.items[index] = action.payload.appointment;
        } else if (index !== -1) {
          state.items[index].status = "assigned";
        }
      })
      .addCase(assignDoctor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // unassignDoctor
      .addCase(unassignDoctor.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(unassignDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Doctor unassigned successfully!";
        const index = state.items.findIndex((a) => a._id === action.payload.appointmentId);
        if (index !== -1 && action.payload.appointment) {
          state.items[index] = action.payload.appointment;
        } else if (index !== -1) {
          state.items[index].status = "unassigned";
          state.items[index].doctorId = null;
        }
      })
      .addCase(unassignDoctor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // acceptAssignment
      .addCase(acceptAssignment.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Assignment accepted!";
        const item = state.doctorAppointments.find((a) => a._id === action.payload.appointmentId);
        if (item) item.status = "accepted";
      })

      // rejectAssignment
      .addCase(rejectAssignment.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Assignment rejected. Admin notified.";
        // Remove from doctor's active list
        state.doctorAppointments = state.doctorAppointments.filter(
          (a) => a._id !== action.payload.appointmentId
        );
      })

      // redirectDoctor
      .addCase(redirectDoctor.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Redirection requested. Admin will confirm.";
        const item = state.doctorAppointments.find((a) => a._id === action.payload.appointmentId);
        if (item) item.status = "redirected_to_doctor";
      })

      // redirectAdmin
      .addCase(redirectAdmin.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Patient redirected to admin.";
        state.doctorAppointments = state.doctorAppointments.filter(
          (a) => a._id !== action.payload.appointmentId
        );
      })

      // completeAppointment
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.successMessage = "Appointment completed!";
        const item = state.doctorAppointments.find((a) => a._id === action.payload.appointmentId);
        if (item) item.status = "completed";
      });
  },
});

export const { clearAppointmentMessages } = appointmentSlice.actions;
export default appointmentSlice.reducer;
