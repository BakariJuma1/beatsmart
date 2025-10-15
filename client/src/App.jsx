import { Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import ArtistDashboard from "./pages/ArtistDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ "buyer"]}>
            <ArtistDashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ "admin"]}>
            <ProducerDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
