import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, Music, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to login with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white p-3 py-6">
      <div className="w-full max-w-sm mx-auto">
     
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white">Beats by Baraju</h1>
              <p className="text-red-400 text-xs">Premium Beats & Soundpacks</p>
            </div>
          </Link>
          <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-xs">Sign in to access your beats</p>
        </motion.div>

       
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-lg border border-red-700/30 rounded-xl p-4 shadow-2xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg mb-3 text-xs"
            >
              {error}
            </motion.div>
          )}

          {/* Email Input */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-8 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-8 pr-9 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold text-sm transition-all mb-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-2 text-gray-400 text-xs">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold mb-3 transition-all text-xs"
          >
            <svg className="w-3 h-3 mr-1.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          {/* Forgot Password & Sign Up */}
          <div className="text-center space-y-1.5">
            <Link
              to="/forgot-password"
              className="text-red-400 hover:text-red-300 text-xs transition-colors block"
            >
              Forgot password?
            </Link>
            <p className="text-gray-400 text-xs">
              No account?{" "}
              <Link
                to="/signup"
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Features - Made more compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 mt-4 text-center"
        >
          <div className="text-gray-400">
            <Sparkles className="w-3 h-3 mx-auto mb-0.5 text-red-400" />
            <p className="text-xs">Premium Beats</p>
          </div>
          <div className="text-gray-400">
            <div className="w-2 h-2 mx-auto mb-0.5 bg-green-400 rounded-full"></div>
            <p className="text-xs">Instant Delivery</p>
          </div>
          <div className="text-gray-400">
            <div className="w-2 h-2 mx-auto mb-0.5 bg-blue-400 rounded-full"></div>
            <p className="text-xs">24/7 Support</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}