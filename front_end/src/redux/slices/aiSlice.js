import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  askAiAssistant,
  fetchAiHistory,
  deleteAiHistory,
  fetchContextOptions,
} from "../../api/aiApi";

// Ask AI query with target options
export const queryAiAssistant = createAsyncThunk(
  "ai/queryAiAssistant",
  async ({ prompt, targetPatientId, targetRecordId, targetDoctorId, customContext }, { rejectWithValue }) => {
    try {
      const data = await askAiAssistant(prompt, {
        targetPatientId,
        targetRecordId,
        targetDoctorId,
        customContext,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Unable to process the AI request. Please try again.");
    }
  }
);

// Load conversation history from MongoDB
export const loadAiHistory = createAsyncThunk(
  "ai/loadAiHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAiHistory();
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load conversation history.");
    }
  }
);

// Clear conversation history in MongoDB
export const resetAiHistory = createAsyncThunk(
  "ai/resetAiHistory",
  async (_, { rejectWithValue }) => {
    try {
      await deleteAiHistory();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to clear conversation history.");
    }
  }
);

// Load context dropdown options (patients, records, doctors)
export const loadContextOptions = createAsyncThunk(
  "ai/loadContextOptions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchContextOptions();
      return data.data || { patients: [], records: [], doctors: [] };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load context options.");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    history: [],
    contextOptions: {
      patients: [],
      records: [],
      doctors: [],
    },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    historyStatus: "idle",
    optionsStatus: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAiState: (state) => {
      state.history = [];
      state.status = "idle";
      state.historyStatus = "idle";
      state.optionsStatus = "idle";
      state.error = null;
      state.contextOptions = {
        patients: [],
        records: [],
        doctors: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // queryAiAssistant
      .addCase(queryAiAssistant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(queryAiAssistant.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.chat) {
          state.history.push(action.payload.chat);
        }
      })
      .addCase(queryAiAssistant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // loadAiHistory
      .addCase(loadAiHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(loadAiHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      })
      .addCase(loadAiHistory.rejected, (state) => {
        state.historyStatus = "failed";
      })

      // resetAiHistory
      .addCase(resetAiHistory.fulfilled, (state) => {
        state.history = [];
      })

      // loadContextOptions
      .addCase(loadContextOptions.pending, (state) => {
        state.optionsStatus = "loading";
      })
      .addCase(loadContextOptions.fulfilled, (state, action) => {
        state.optionsStatus = "succeeded";
        state.contextOptions = action.payload;
      })
      .addCase(loadContextOptions.rejected, (state) => {
        state.optionsStatus = "failed";
      });
  },
});

export const { clearError, clearAiState } = aiSlice.actions;
export default aiSlice.reducer;
