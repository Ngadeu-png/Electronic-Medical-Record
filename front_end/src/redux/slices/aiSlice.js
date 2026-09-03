import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { askAiAssistant } from "../../api/aiApi";

export const queryAiAssistant = createAsyncThunk(
  "ai/queryAiAssistant",
  async ({ prompt, context }, { rejectWithValue }) => {
    try {
      const data = await askAiAssistant(prompt, context);
      return data.response;
    } catch (err) {
      return rejectWithValue(err.message || "Unable to process the AI request. Please try again.");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    response: "",
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    history: [],
  },
  reducers: {
    clearAiResponse: (state) => {
      state.response = "";
      state.error = null;
      state.status = "idle";
    },
    clearAiHistory: (state) => {
      state.history = [];
      state.response = "";
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryAiAssistant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(queryAiAssistant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.response = action.payload;
        state.history.push({
          response: action.payload,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(queryAiAssistant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAiResponse, clearAiHistory } = aiSlice.actions;
export default aiSlice.reducer;
