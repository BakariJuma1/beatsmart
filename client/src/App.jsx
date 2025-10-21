import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import ArtistDashboard from "./pages/ArtistDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/NavBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import BeatStore from "./pages/BeatStore";
import SoundPacks from "./pages/SoundPacks";
import ForgotPassword from "./pages/ForgotPassword";

function AppRoutes() {
  const { role, loading } = useAuth();

  if (loading) return <div>Loading...</div>; 

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/beat-store" element={<BeatStore />} />
      <Route path="/soundpacks" element={<SoundPacks />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

   
      <Route
        path="/dashboard"
        element={
          role === "producer" ? (
            <ProtectedRoute allowedRoles={["producer"]}>
              <ProducerDashboard />
            </ProtectedRoute>
          ) : (
            <ProtectedRoute allowedRoles={["artist"]}>
              <ArtistDashboard />
            </ProtectedRoute>
          )
        }
      />

   
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
}
