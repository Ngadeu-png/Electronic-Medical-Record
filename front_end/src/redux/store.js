import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./slices/doctorSlice";
import patientReducer from "./slices/patientSlice";
import viewModeReducer from "./slices/viewModeSlice";
import appointmentReducer from "./slices/appointmentSlice";
import medicalRecordReducer from "./slices/medicalRecordSlice";

export const store = configureStore({
  reducer: {
    doctors: doctorReducer,
    patients: patientReducer,
    viewMode: viewModeReducer, // 'grid' or 'table'
    appointments: appointmentReducer,
    medicalRecords: medicalRecordReducer,
  },
});

export default store;