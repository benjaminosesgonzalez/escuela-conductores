import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import Login from "./Login.jsx";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import {
  DashboardProfesor,
  DashboardAlumno,
  DashboardSecretaria,
} from "./index.js";
import Registro from "./alumno/Registro.jsx";
import ConfirmarPlan from "./alumno/ConfirmarPlan.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta pública - Landing Page (inicio) */}
        <Route path="/" element={<LandingPage />} />

        {/* Ruta pública - Login */}
        <Route path="/login" element={<Login />} />

        <Route path="/registro" element={<Registro />} />
        <Route path="/confirmar-plan" element={<ConfirmarPlan />} />

        {/* Rutas protegidas por rol */}
        <Route
          path="/profesor"
          element={
            <ProtectedRoute requiredRole="profesor">
              <DashboardProfesor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno"
          element={
            <ProtectedRoute requiredRole="alumno">
              <DashboardAlumno />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretaria"
          element={
            <ProtectedRoute requiredRole="secretaria">
              <DashboardSecretaria />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
