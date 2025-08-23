/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { User, Mail, Lock, Save, Loader, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UserProfilePage = () => {
  const { authUser } = useAuthStore();
  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        setProfile({
          fullName: res.data.fullName,
          email: res.data.email,
        });
      } catch (error) {
        toast.error("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      await axiosInstance.put("/users/profile", profile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsPasswordLoading(true);
    try {
      const res = await axiosInstance.put("/users/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      toast.success(res.data.message);
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and password.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Information Form */}
          <div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-600"
                >
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-gray-900"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600"
                >
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-gray-900"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {isProfileLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isProfileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-600"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-gray-900"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-600"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-gray-900"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-600"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-gray-900"
                  value={password.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {isPasswordLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
