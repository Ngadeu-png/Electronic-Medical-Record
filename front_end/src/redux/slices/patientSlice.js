import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPatients = createAsyncThunk('patients/fetchPatients', async () => {
  const res = await fetch('http://localhost:5000/api/patients', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const data = await res.json();
  return data; // assume array of patients
});

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error fetching patients';
      });
  },
});

export default patientSlice.reducer;