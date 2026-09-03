# CENTRIC CARE — Task Tracker

## STEP 1 — BACKEND
- [x] Fix db-models.js — appointment status enum, assignmentHistory, fix Doctor ref to User
- [x] Fix middleware.js — try/catch on jwt.verify
- [x] Add src/authorize.js — role-based auth
- [x] Fix auths.js — signup bugs, getPatients filter
- [x] Fix dotors.js — email template, password hashing, getDoctorAssignedAppointments, getDoctorStatistics
- [x] Fix/extend admin.js — assign with history, unassign, getPending, statistics
- [x] Fix/extend appoints.js — default status, getMyAppointments, acceptAssignment, rejectAssignment, requestRedirection, requestRedirectionToAdmin, completeAppointment
- [x] Fix medicalRecord.js — auth validation, doctor-patient relationship access control
- [x] Fix apoints.route.js — fix broken routes, role-based auth, new endpoints
- [x] Fix admin.route.js — auth middleware, statistics, appointment management
- [x] Fix medicalRecord.js route — auth middleware and role protection
- [x] Fix doctor.route.js — role-based auth, statistics, assigned appointments
- [x] Fix patientRoutes.js — auth middleware, password hashing

## STEP 2 — REDUX
- [x] Add appointmentSlice.js with all async thunks
- [x] Add medicalRecordSlice.js with all async thunks
- [x] Update store.js with new reducers

## STEP 3 — API LAYER
- [x] Fill global.js with BASE_URL and auth headers helper
- [x] Fill adminApi.js
- [x] Fill patientApi.js
- [x] Fill authApi.js

## STEP 4 — FRONTEND PAGES
- [x] Fix PatientList.jsx — setViewMode undefined bug fixed
- [x] Fix patientdash.jsx — missing import fixed
- [x] Fix DoctorAppoint.jsx — complete accept, reject (with reason modal), redirect, and complete UI
- [x] Fix Patientrecord.jsx — removed hardcoded IDs, dynamic doctor & appointment linking, Redux
- [x] Improve admin Overview.jsx — full patient demographics, Redux, unassign button, doctor modal with specialty filter
- [x] Add admin AdminDashboard.jsx — real KPI stats, reassignment alert banner, pending queue
- [x] Improve patient Patientoverview.jsx — real data, status badges, assigned doctor details
- [x] Fix patient appointment.jsx — Redux integration, Inpatient enum fix
- [x] Fix patient Myrecord.jsx — Redux medicalRecordSlice integration
- [x] Fix doctor Patient.jsx — authorized patients filter
- [x] Fix doctor DoctorOverview.jsx — React Router Link navigation, real statistics API
- [x] Fix router.jsx — AdminDashboard at admin index, clean route tree
- [x] Fix AdminSidebar.jsx & DoctorSidebar.jsx — CENTRIC CARE branding, logout button, clean icons
- [x] Fix Header.tsx — search input event bug

## STEP 5 — VERIFY
- [x] Codebase audited and verified
