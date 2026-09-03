import { configureStore } from '@reduxjs/toolkit';
import doctorReducer from './slices/doctorSlice';
import patientReducer from './slices/patientSlice';
import viewModeReducer from './slices/viewModeSlice';

export const store = configureStore({
  reducer: {
    doctors: doctorReducer,
    patients: patientReducer,
    viewMode: viewModeReducer, // 'grid' or 'table'
  },
});

export default store;