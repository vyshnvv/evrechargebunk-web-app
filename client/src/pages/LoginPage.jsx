import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Zap,
  LogIn,
  User,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      login({ ...formData, loginType });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="backdrop-blur-md bg-white/40 border border-white/50 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">Power up your EV journey</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  loginType === "user"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
                onClick={() => setLoginType("user")}
              >
                <User className="w-4 h-4" />
                User Login
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  loginType === "admin"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
                onClick={() => setLoginType("admin")}
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl 
                         focus:border-emerald-400 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-200
                         text-gray-800 placeholder-gray-500 transition-all duration-200"
                placeholder={`Enter your ${loginType} email`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl 
                           focus:border-emerald-400 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-200
                           text-gray-800 placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 
                       text-white font-medium rounded-xl shadow-lg hover:shadow-emerald-200 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 
                       transition-all duration-200"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {loginType === "admin"
                    ? "Access Admin Panel"
                    : "Start Charging"}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          {loginType === "user" && (
            <div className="text-center pt-6 mt-6 border-t border-white/30">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Join the EV Revolution
                </Link>
              </p>
            </div>
          )}

          {/* Admin Note */}
          {loginType === "admin" && (
            <div className="text-center pt-6 mt-6 border-t border-white/30">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100/50 backdrop-blur-sm rounded-lg border border-amber-200/50">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 text-xs font-medium">
                  Admin access only
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full border border-white/40">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600 text-xs">
              Eco-Friendly • Secure • Fast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
