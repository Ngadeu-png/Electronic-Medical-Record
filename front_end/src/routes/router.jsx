import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

// import application layouts and pages
import App_Layout from "../routes/app_layout";
import Login from "../pages/auths/Login";
import Register from "../pages/auths/Register";
import LandingPage from "../pages/LandingPage";
import ForgotPassword from "../pages/auths/ForgotPassword";
import VerificationCode from "../pages/auths/VerificationCode";
import ResetPassword from "../pages/auths/ResetPassword";
import BookAppointmentForm from "../pages/patient/appointment";
import ConsultationJoin from "../pages/patient/consultation";
import Overview from "../pages/patient/Patientoverview";
import Adminpage from "../pages/admin/Overview";
import PatientLayout from "../layout/PatientLayout";
import AdminLayout from "../layout/AdminLayout";
import Consultation from "../pages/admin/Consultation";
import DoctorForm from "../pages/admin/DoctorForm";
import Myrecord from "../pages/patient/Myrecord";
import DoctorAppoint from "../pages/doctor/DoctorAppoint";
import DoctorLayout from "../layout/DoctorLayout";
import Availability from "../pages/doctor/Availability";
import PatientList from "../components/PatientList";
//import Patientrecord from "../pages/doctor/Patientrecord";
import Startconsultion from "../pages/doctor/Startconsultation";
import Startconsultation from "../pages/doctor/Startconsultation";
import Patientrecord from "../pages/doctor/Patientrecord";
import Patient from "../pages/doctor/Patient";
import DoctorOverview from "../pages/doctor/DoctorOverview";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App_Layout />}>
      <Route index element={<LandingPage />} />

      <Route path="/auths">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="vercode" element={<VerificationCode />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Overview />} />
        <Route path="appointment" element={<BookAppointmentForm />} />
        <Route path="consultation" element={<ConsultationJoin />} />
        <Route path="consultation" element={<ConsultationJoin />} />
        <Route path="Myrecord" element={<Myrecord />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="appointment" element={<Adminpage />} />
        <Route path="Consultation" element={<Consultation />} />
        <Route path="DoctorForm" element={<DoctorForm />} />
        <Route path="patients" element={<PatientList />} />
      </Route>
      <Route path="/Doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorOverview />} />
        <Route path="Availability" element={<Availability />} />
        <Route path="DoctorAppoint" element={<DoctorAppoint />} />
        <Route path=":doctorId/appointments" element={<DoctorAppoint />} />
        <Route path="Startconsultation" element={<Startconsultation />} />
        <Route path="patients" element={<Patient />} />
        <Route path="patients/patient/:patientId" element={<Patientrecord />} />

        {/* <Route path="Patientrecord" element={<Patientrecord />} /> */}
        {/* <Route path="Startconsultation" element={<Startconsultation />} /> */}
      </Route>
    </Route>
  )
);
