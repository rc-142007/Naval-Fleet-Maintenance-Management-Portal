
import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Personnel from "./pages/admin/Personnel";
import Equipment from "./pages/admin/Equipment";

// Officer Pages
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerInspections from "./pages/officer/OfficerInspections";

// Technician Pages
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import Inspections from "./pages/technician/Inspections";
import Problems from "./pages/technician/Problems";
import OfficerProblems from "./pages/officer/OfficerProblems";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Personnel />} />
        <Route path="/admin/equipment" element={<Equipment />} />
      </Route>

      {/* Officer Routes */}
      <Route element={<ProtectedRoute allowedRoles={["OFFICER"]} />}>
        <Route path="/officer" element={<OfficerDashboard />} />
        <Route path="/officer/inspections" element={<OfficerInspections />} />
        <Route path="/officer/equipment" element={<Equipment />} />
      </Route>

      {/* Technician Routes */}
      <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route path="/technician/inspections" element={<Inspections />} />
        <Route path="/technician/problems" element={<Problems />} />
      </Route>

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={<h2>403 - Unauthorized Access</h2>}
      />

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
  path="/officer/problems"
  element={<OfficerProblems />}
/>
    </Routes>
  );
}

export default App;
  