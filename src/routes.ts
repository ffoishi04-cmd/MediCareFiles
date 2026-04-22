import { createBrowserRouter } from "react-router";
import { LandingPage } from "./UserInterface/pages/LandingPage";
import { LoginPage } from "./UserInterface/pages/LoginPage";
import { StudentDashboard } from "./UserInterface/pages/StudentDashboard";
import { DoctorDashboard } from "./UserInterface/pages/DoctorDashboard";
import { PharmacyDashboard } from "./UserInterface/pages/PharmacyDashboard";
import { AdminDashboard } from "./UserInterface/pages/AdminDashboard";
import { AmbulanceModule } from "./UserInterface/pages/AmbulanceModule";

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
