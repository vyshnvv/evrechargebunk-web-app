/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Zap,
  Battery,
  MapPin,
  Leaf,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const debounceTimer = useRef(null);
  const { signUp, isSigningUp } = useAuthStore();

  useEffect(() => {
    if (!formData.fullName.trim()) {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [formData.fullName]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    return true;
  };

  const isFormValid = useMemo(() => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      formData.password.length >= 6
    );
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      signUp({
        ...formData,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-lime-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm text-emerald-700 text-sm font-medium rounded-full border border-white/50">
                <Leaf className="w-4 h-4" />
                Join the Green Revolution
              </div>

              <h1 className="text-5xl lg:text-6xl font-light text-gray-800 leading-tight">
                Power Your
                <span className="block text-emerald-600 font-medium">
                  Electric Future
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Connect to a network of smart charging stations. Find, reserve,
                and pay for EV charging anywhere, anytime.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Smart Charging Network
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Access thousands of charging stations with real-time
                    availability and smart booking
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-lime-500 rounded-xl flex items-center justify-center shadow-md">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Route Planning
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Plan optimal routes with charging stops and get real-time
                    navigation assistance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Eco Impact Tracking
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Monitor your carbon footprint savings and contribute to a
                    cleaner planet
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-md bg-white/40 border border-white/50 rounded-3xl p-8 shadow-xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Start Your Journey
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Create your EV charging account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl 
                               focus:border-emerald-400 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-200
                               text-gray-800 placeholder-gray-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  {/* Email */}
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
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Password */}
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
                        placeholder="Create a secure password"
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
                    disabled={isSigningUp || !isFormValid}
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Join the Revolution
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center pt-6 mt-6 border-t border-white/30">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Sign in to charge
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="text-center pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full border border-white/40">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-600 text-xs">
            Carbon Neutral • Sustainable • Future Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
