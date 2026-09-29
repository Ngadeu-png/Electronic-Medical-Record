import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "../../api/global";

// ── Async Thunks ─────────────────────────────────────────────

// Initiate CamPay Payment
export const initiatePayment = createAsyncThunk(
  "payments/initiatePayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/initiate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate payment");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Verify CamPay Payment Status
export const verifyPayment = createAsyncThunk(
  "payments/verifyPayment",
  async (reference, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/verify/${reference}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify payment");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch Payment by Appointment ID
export const fetchPaymentByAppointment = createAsyncThunk(
  "payments/fetchPaymentByAppointment",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/appointment/${appointmentId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch payment details");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────
const initialState = {
  currentPayment: null,
  reference: null,
  status: "idle", // 'idle' | 'loading' | 'processing' | 'succeeded' | 'failed'
  paymentStatus: "idle", // 'idle' | 'pending' | 'processing' | 'paid' | 'failed'
  error: null,
  message: null,
};

// ── Slice ─────────────────────────────────────────────────────
const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.currentPayment = null;
      state.reference = null;
      state.status = "idle";
      state.paymentStatus = "idle";
      state.error = null;
      state.message = null;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // initiatePayment
      .addCase(initiatePayment.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.status = "processing";
        state.paymentStatus = "processing";
        state.currentPayment = action.payload.payment;
        state.reference = action.payload.reference;
        state.message = action.payload.message;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.status = "failed";
        state.paymentStatus = "failed";
        state.error = action.payload;
      })

      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        const pStatus = action.payload.status || action.payload.paymentStatus;
        state.paymentStatus = pStatus;
        state.currentPayment = action.payload.payment || state.currentPayment;

        if (pStatus === "paid") {
          state.status = "succeeded";
          state.message = "Payment verified successfully!";
        } else if (pStatus === "failed") {
          state.status = "failed";
          state.error = action.payload.message || "Payment was not successful";
        } else {
          state.status = "processing";
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchPaymentByAppointment
      .addCase(fetchPaymentByAppointment.fulfilled, (state, action) => {
        if (action.payload.payment) {
          state.currentPayment = action.payload.payment;
          state.paymentStatus = action.payload.payment.status;
          state.reference = action.payload.payment.reference;
        } else {
          state.paymentStatus = action.payload.paymentStatus || "pending";
        }
      });
  },
});

export const { resetPaymentState, clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
