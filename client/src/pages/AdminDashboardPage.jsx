import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Shield,
  Users,
  Battery,
  MapPin,
  Activity,
  LogOut,
  Zap,
  TrendingUp,
  Plus,
  Edit,
  Trash,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import LocationPickerMap from "../components/LocationPickerMap"; // Adjust path if needed

// NEW: Centralized configuration for charger types
const CHARGER_OPTIONS = {
  "AC Level 1": { power: "2-3 kW", defaultPrice: 8 },
  "AC Level 2": { power: "7-22 kW", defaultPrice: 14 },
  "DC Fast Charging": { power: "15-50 kW", defaultPrice: 18 },
  "DC Ultra-Fast Charging": { power: "50-350 kW", defaultPrice: 22 },
};

// Helper function to calculate time since a date
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return "just now";
};

// NEW HELPER COMPONENT: Manages the list of charger types for a bunk
const ChargerManager = ({ value: chargerTypes, onChange }) => {
  const [newCharger, setNewCharger] = useState({
    type: "AC Level 2",
    price: CHARGER_OPTIONS["AC Level 2"].defaultPrice,
    count: 1,
  });

  const handleAddCharger = () => {
    if (
      !newCharger.count ||
      newCharger.count < 1 ||
      !newCharger.price ||
      newCharger.price < 0
    ) {
      toast.error("Charger count and price must be valid, positive numbers.");
      return;
    }
    const power = CHARGER_OPTIONS[newCharger.type].power;
    onChange([
      ...chargerTypes,
      { ...newCharger, power, count: parseInt(newCharger.count) },
    ]);
  };

  const handleRemoveCharger = (index) => {
    onChange(chargerTypes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-3 bg-gray-50/50 rounded-lg border">
      {/* List of added chargers */}
      {chargerTypes.length > 0 && (
        <div className="space-y-2">
          {chargerTypes.map((charger, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded-md border"
            >
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {charger.type}
                </p>
                <p className="text-xs text-gray-500">
                  {charger.count} points • ₹{charger.price}/kWh •{" "}
                  {charger.power}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCharger(index)}
                className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form to add a new charger */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end pt-2">
        <div className="col-span-full sm:col-span-1">
          <label className="text-xs font-medium text-gray-600">Type</label>
          <select
            value={newCharger.type}
            onChange={(e) =>
              setNewCharger({
                ...newCharger,
                type: e.target.value,
                price: CHARGER_OPTIONS[e.target.value].defaultPrice,
              })
            }
            className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
          >
            {Object.keys(CHARGER_OPTIONS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-full sm:col-span-1">
          <label className="text-xs font-medium text-gray-600">
            Price (₹/kWh)
          </label>
          <input
            type="number"
            min="0"
            value={newCharger.price}
            onChange={(e) =>
              setNewCharger({ ...newCharger, price: e.target.value })
            }
            className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
          />
        </div>
        <div className="col-span-full sm:col-span-1">
          <label className="text-xs font-medium text-gray-600">
            No. of Points
          </label>
          <input
            type="number"
            min="1"
            value={newCharger.count}
            onChange={(e) =>
              setNewCharger({ ...newCharger, count: e.target.value })
            }
            className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCharger}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm w-full sm:w-auto"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// NEW COMPONENT: Reservation Details Modal
const ReservationModal = ({ bunk, isOpen, onClose, onCancelReservation }) => {
  if (!isOpen || !bunk) return null;

  const activeReservations =
    bunk.reservations?.filter((r) => r.status === "active") || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Reservations for {bunk.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Available Points
              </span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {bunk.availablePoints}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                Active Reservations
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {activeReservations.length}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {bunk.chargingPoints}
            </p>
          </div>
        </div>

        {activeReservations.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-3">
              Active Reservations
            </h4>
            {activeReservations.map((reservation, index) => (
              <div
                key={reservation._id || index}
                className="bg-gray-50 p-4 rounded-lg border"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      User ID
                    </label>
                    <p className="text-sm text-gray-800 font-mono">
                      {reservation.userId}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Charger Type
                    </label>
                    <p className="text-sm text-gray-800">
                      {reservation.chargerType}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      ETA
                    </label>
                    <p className="text-sm text-gray-800">
                      {new Date(reservation.eta).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Fee
                    </label>
                    <p className="text-sm text-gray-800">
                      ₹{reservation.reservationFee}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      Created:{" "}
                      {new Date(reservation.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      Expires:{" "}
                      {new Date(reservation.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      onCancelReservation(bunk._id, reservation._id)
                    }
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel Reservation
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No active reservations for this station
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStations: 0,
    totalReservations: 0,
    recentUsers: 0,
  });

  const [bunks, setBunks] = useState([]);
  const [newBunk, setNewBunk] = useState({
    name: "",
    location: "",
    coordinates: { lat: null, lng: null },
    chargerTypes: [],
    status: "active",
  });
  const [editingId, setEditingId] = useState(null);
  const [editBunk, setEditBunk] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedBunkForReservations, setSelectedBunkForReservations] =
    useState(null);
  // --- UPDATED STATE FOR RECENT ACTIVITY ---
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchBunks();
    fetchUserStats();
    // --- FETCH RECENT ACTIVITY ON COMPONENT MOUNT ---
    fetchRecentActivity();
  }, []);

  // --- UPDATED FUNCTION TO FETCH RECENT ACTIVITY ---
  const fetchRecentActivity = async () => {
    try {
      const res = await axiosInstance.get("/activity/recent");
      setRecentActivity(res.data);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      toast.error("Failed to load recent activity");
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await axiosInstance.get("/users/stats");
      setStats((prev) => ({
        ...prev,
        totalUsers: res.data.totalUsers,
        recentUsers: res.data.recentUsers,
      }));
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Keep default values if fetch fails
    }
  };

  const fetchBunks = async () => {
    try {
      const res = await axiosInstance.get("/bunks");
      setBunks(res.data);

      // Calculate stats from bunks data
      const activeStationsCount = res.data.filter(
        (b) => b.status === "active"
      ).length;
      const totalReservationsCount = res.data.reduce(
        (sum, bunk) =>
          sum +
          (bunk.reservations?.filter((r) => r.status === "active").length || 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        activeStations: activeStationsCount,
        totalReservations: totalReservationsCount,
      }));
    } catch (error) {
      console.error("Error fetching bunks:", error);
      toast.error("Failed to load charging stations");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return (
        data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      );
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  const handleLocationSelect = async (latlng) => {
    const locationName = await reverseGeocode(latlng.lat, latlng.lng);
    const newLocationData = {
      location: locationName,
      coordinates: { lat: latlng.lat, lng: latlng.lng },
    };
    if (editingId) {
      setEditBunk((prev) => ({ ...prev, ...newLocationData }));
    } else {
      setNewBunk((prev) => ({ ...prev, ...newLocationData }));
    }
  };

  const handleCreateBunk = async () => {
    if (
      !newBunk.name ||
      !newBunk.location ||
      newBunk.chargerTypes.length === 0
    ) {
      toast.error(
        "Name, location, and at least one charger type are required."
      );
      return;
    }
    try {
      const res = await axiosInstance.post("/bunks", newBunk);
      setBunks([...bunks, res.data]);
      setIsAdding(false);
      setNewBunk({
        name: "",
        location: "",
        coordinates: { lat: null, lng: null },
        chargerTypes: [],
        status: "active",
      });
      toast.success("Charging station created successfully");
      setStats((prev) => ({
        ...prev,
        activeStations:
          prev.activeStations + (newBunk.status === "active" ? 1 : 0),
      }));
      // Refresh activity after creating a new station
      fetchRecentActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create station");
    }
  };

  const handleUpdateBunk = async (id) => {
    try {
      const res = await axiosInstance.patch(`/bunks/${id}`, editBunk);
      setBunks(bunks.map((b) => (b._id === id ? res.data : b)));
      setEditingId(null);
      setEditBunk({});
      toast.success("Station updated successfully");
      // Refresh stats after update
      fetchBunks();
      // Refresh activity after update
      fetchRecentActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update station");
    }
  };

  const handleDeleteBunk = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this charging station?")
    )
      return;
    try {
      const bunkToDelete = bunks.find((b) => b._id === id);
      await axiosInstance.delete(`/bunks/${id}`);
      setBunks(bunks.filter((b) => b._id !== id));
      toast.success("Station deleted successfully");
      if (bunkToDelete.status === "active") {
        setStats((prev) => ({
          ...prev,
          activeStations: prev.activeStations - 1,
          totalReservations:
            prev.totalReservations -
            (bunkToDelete.reservations?.filter((r) => r.status === "active")
              .length || 0),
        }));
      }
      // Refresh activity after deletion
      fetchRecentActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete station");
    }
  };

  const handleAdminCancelReservation = async (bunkId, reservationId) => {
    if (
      !window.confirm(
        "Are you sure you want to manually cancel this user's reservation?"
      )
    )
      return;

    try {
      await axiosInstance.patch(
        `/bunks/${bunkId}/reservations/${reservationId}/cancel`
      );
      toast.success("Reservation cancelled successfully");
      fetchBunks(); // Refresh data
      setSelectedBunkForReservations(null); // Close modal after action
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel reservation"
      );
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedBunks = [...bunks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "ascending" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleLogout = () => logout();
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const LocationPickerModal = () => {
    const initialPosition = editingId
      ? editBunk.coordinates?.lat && editBunk.coordinates?.lng
        ? editBunk.coordinates
        : null
      : newBunk.coordinates?.lat && newBunk.coordinates?.lng
      ? newBunk.coordinates
      : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Select Location
            </h3>
            <button
              onClick={() => setShowLocationPicker(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Click on the map to place a marker for the charging station.
          </p>
          <div className="flex-grow">
            <LocationPickerMap
              onLocationSelect={handleLocationSelect}
              initialPosition={initialPosition}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowLocationPicker(false)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">EV Charging Network</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {authUser?.fullName}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {authUser?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back, {authUser?.fullName}
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your EV charging network today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  +{stats.recentUsers} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Stations</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.activeStations}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Battery className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Reservations</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalReservations}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charging Stations Management */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Battery className="w-5 h-5 text-emerald-600" /> Charging Stations
              Management
            </h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Station
            </button>
          </div>

          {/* ADD STATION FORM */}
          {isAdding && (
            <div className="bg-white/50 p-4 rounded-xl mb-6 border border-emerald-200 space-y-4">
              <h4 className="font-medium text-gray-800">
                Add New Charging Station
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Station Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Downtown Charging Hub"
                    className="w-full p-2 bg-white/70 border text-gray-800 border-gray-300 rounded-lg"
                    value={newBunk.name}
                    onChange={(e) =>
                      setNewBunk({ ...newBunk, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full p-2 bg-white/70 border text-gray-800 border-gray-300 rounded-lg"
                    value={newBunk.status}
                    onChange={(e) =>
                      setNewBunk({ ...newBunk, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Select location using the map button"
                    className="flex-1 p-2 bg-white/70 border border-gray-300 rounded-lg text-gray-800"
                    value={newBunk.location}
                    readOnly
                  />
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Select on Map
                  </button>
                </div>
                {newBunk.coordinates.lat && (
                  <p className="text-xs text-gray-600 mt-1">
                    Coordinates: {newBunk.coordinates.lat.toFixed(6)},{" "}
                    {newBunk.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Charger Configuration *
                </label>
                <ChargerManager
                  value={newBunk.chargerTypes}
                  onChange={(updatedTypes) =>
                    setNewBunk({ ...newBunk, chargerTypes: updatedTypes })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBunk}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Create Station
                </button>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    Station Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Configuration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBunks.length > 0 ? (
                  sortedBunks.map((bunk) => (
                    <tr
                      key={bunk._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        {editingId === bunk._id ? (
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg text-gray-800"
                            value={editBunk.name}
                            onChange={(e) =>
                              setEditBunk({ ...editBunk, name: e.target.value })
                            }
                          />
                        ) : (
                          <div className="font-medium text-gray-900">
                            {bunk.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs align-top">
                        {editingId === bunk._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-800"
                              value={editBunk.location}
                              readOnly
                            />
                            <button
                              onClick={() => setShowLocationPicker(true)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="text-gray-700 text-sm truncate"
                            title={bunk.location}
                          >
                            {bunk.location || "No location set"}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {editingId === bunk._id ? (
                          <ChargerManager
                            value={editBunk.chargerTypes}
                            onChange={(updatedTypes) =>
                              setEditBunk({
                                ...editBunk,
                                chargerTypes: updatedTypes,
                              })
                            }
                          />
                        ) : (
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-emerald-700 pb-1">
                              Total Charging Slots: {bunk.chargingPoints}
                            </div>
                            {bunk.chargerTypes?.map((charger, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-semibold text-gray-800">
                                  {charger.type}:{" "}
                                </span>
                                <span className="text-gray-600">
                                  {charger.count} @ ₹{charger.price}/kWh
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Battery className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Available: {bunk.availablePoints}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700">
                              Reserved:{" "}
                              {bunk.reservations?.filter(
                                (r) => r.status === "active"
                              ).length || 0}
                            </span>
                          </div>
                          {(bunk.reservations?.filter(
                            (r) => r.status === "active"
                          ).length || 0) > 0 && (
                            <button
                              onClick={() =>
                                setSelectedBunkForReservations(bunk)
                              }
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {editingId === bunk._id ? (
                          <select
                            className="w-full p-2 border border-gray-300 rounded-lg text-gray-800"
                            value={editBunk.status}
                            onChange={(e) =>
                              setEditBunk({
                                ...editBunk,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              bunk.status
                            )}`}
                          >
                            {bunk.status.charAt(0).toUpperCase() +
                              bunk.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {editingId === bunk._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateBunk(bunk._id)}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditBunk({});
                                  }}
                                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(bunk._id);
                                    setEditBunk({ ...bunk });
                                  }}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBunk(bunk._id)}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          {bunk.coordinates?.lat && bunk.coordinates?.lng && (
                            <button
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${bunk.coordinates.lat},${bunk.coordinates.lng}`,
                                  "_blank"
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs"
                            >
                              <MapPin className="w-3.5 h-3.5" /> Directions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No charging stations found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- UPDATED RECENT ACTIVITY SECTION --- */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-600" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center gap-4 p-3 bg-white/30 rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activity.type === "user_registration"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {activity.type === "user_registration" ? (
                      <User className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    {activity.type === "user_registration" ? (
                      <div>
                        <p className="text-sm text-gray-800">
                          New user{" "}
                          <span className="font-semibold text-emerald-700">
                            {activity.data.fullName}
                          </span>{" "}
                          has registered.
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {timeSince(activity.activityDate)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold text-emerald-700">
                            {activity.data.userName}
                          </span>{" "}
                          reserved a slot at{" "}
                          <span className="font-semibold text-blue-700">
                            {activity.data.bunkName}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.data.chargerType}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{activity.data.reservationFee} fee
                          </p>
                          <p className="text-xs text-gray-500">
                            ETA: {new Date(activity.data.eta).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {timeSince(activity.activityDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && <LocationPickerModal />}

      {/* Reservation Details Modal */}
      <ReservationModal
        bunk={selectedBunkForReservations}
        isOpen={!!selectedBunkForReservations}
        onClose={() => setSelectedBunkForReservations(null)}
        onCancelReservation={handleAdminCancelReservation}
      />
    </div>
  );
};

export default AdminDashboardPage;
