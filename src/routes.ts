import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { PharmacyDashboard } from "./pages/PharmacyDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AmbulanceModule } from "./pages/AmbulanceModule";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/student-dashboard",
    Component: StudentDashboard,
  },
  {
    path: "/doctor-dashboard",
    Component: DoctorDashboard,
  },
  {
    path: "/pharmacy-dashboard",
    Component: PharmacyDashboard,
  },
  {
    path: "/admin-dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/ambulance",
    Component: AmbulanceModule,
  },
]);
