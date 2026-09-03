import { createSlice } from '@reduxjs/toolkit';

const initialState = 'grid'; // default grid view

const viewModeSlice = createSlice({
  name: 'viewMode',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      return action.payload; // expect 'grid' or 'table'
    },
  },
});

export const { setViewMode } = viewModeSlice.actions;
export default viewModeSlice.reducer;