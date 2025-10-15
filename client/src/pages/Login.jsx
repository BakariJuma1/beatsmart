import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-800 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Login</h2>
        {error && <p className="text-red-400 mb-3">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 bg-neutral-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-neutral-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-semibold"
        >
          Login
        </button>
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-red-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
