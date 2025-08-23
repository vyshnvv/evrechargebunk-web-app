import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  User,
  Battery,
  MapPin,
  History,
  Wallet,
  LogOut,
  Zap,
  Clock,
  Navigation,
  Leaf,
  Search,
  ChevronRight,
  Loader,
  ExternalLink,
  CalendarClock,
  X,
  Plus,
  Award,
  Filter,
  SlidersHorizontal,
  Mail,
  Phone,
  Ban,
} from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// --- Reservation Modal Component ---
const ReservationModal = ({ station, onClose, onConfirm, isReserving }) => {
  const [eta, setEta] = useState("");
  const [selectedCharger, setSelectedCharger] = useState(
    station.chargerTypes[0]?.type || ""
  );
  const [selectedQuickEta, setSelectedQuickEta] = useState(null); // State for quick ETA buttons
  const RESERVATION_FEE = 10; // Fixed reservation fee

  // --- MODIFICATION: Memoize the formatted ETA string for display ---
  const formattedEta = useMemo(() => {
    if (!eta) return "";
    try {
      const date = new Date(eta);
      if (isNaN(date.getTime())) return ""; // Handle invalid date
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, [eta]);

  const handleSubmit = () => {
    console.log("Submitting reservation with:", { eta, selectedCharger });

    if (!eta || !selectedCharger) {
      toast.error("Please select a charger type and your ETA.");
      return;
    }

    // --- MODIFICATION: Validate that the selected ETA is within 12 hours ---
    const selectedEtaDate = new Date(eta);
    const maxDate = new Date();
    maxDate.setHours(maxDate.getHours() + 12);

    if (selectedEtaDate > maxDate) {
      toast.error("You can only reserve a slot up to 12 hours in advance.");
      return;
    }

    const reservationData = {
      chargerType: selectedCharger,
      eta,
      reservationFee: RESERVATION_FEE,
    };

    console.log("Calling onConfirm with:", reservationData);
    onConfirm(reservationData);
  };

  // Set min/max values for the datetime-local input
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
  const minDateTime = minDate.toISOString().slice(0, 16);

  // --- MODIFICATION: Set a maximum value to be 12 hours from now ---
  const maxDate = new Date();
  maxDate.setHours(maxDate.getHours() + 12); // Add 12 hours
  maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset()); // Adjust for timezone
  const maxDateTime = maxDate.toISOString().slice(0, 16); // Format for input

  // Add animation classes
  useEffect(() => {
    const modal = document.querySelector(".reservation-modal");
    if (modal) {
      setTimeout(() => {
        modal.classList.remove("scale-95", "opacity-0");
        modal.classList.add("scale-100", "opacity-100");
      }, 10);
    }
  }, []);

  // Handler for quick ETA selection buttons
  const handleQuickEta = (minutes) => {
    setSelectedQuickEta(minutes);
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    // Adjust for timezone offset for the input value
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const formattedEta = now.toISOString().slice(0, 16);
    setEta(formattedEta);
    console.log(`Quick ETA selected: ${minutes} mins -> ${formattedEta}`);
  };

  return (
    <div
      className="reservation-modal bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300"
      style={{
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        zIndex: 10001,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-emerald-600" /> Reserve a Slot
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-800" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        You are reserving a slot at:{" "}
        <span className="font-medium text-gray-700">{station.name}</span>
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Select Charger Type
          </label>
          <select
            value={selectedCharger}
            onChange={(e) => {
              console.log("Charger type changed to:", e.target.value);
              setSelectedCharger(e.target.value);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
          >
            {station.chargerTypes.map((charger) => (
              <option key={charger.type} value={charger.type}>
                {charger.type} - ₹{charger.price}/kWh
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Quick ETA Options
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[15, 30, 60, 120].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleQuickEta(minutes)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedQuickEta === minutes
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                In {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Or select a specific time
          </label>
          <input
            type="datetime-local"
            value={eta}
            onChange={(e) => {
              console.log("ETA changed to:", e.target.value);
              setEta(e.target.value);
              setSelectedQuickEta(null);
            }}
            min={minDateTime}
            max={maxDateTime}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
          />
          {/* --- MODIFICATION START: Display the formatted time --- */}
          {formattedEta && (
            <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-sm text-center">
              Selected time:{" "}
              <span className="font-semibold">{formattedEta}</span>
            </div>
          )}
          {/* --- MODIFICATION END --- */}
          <p className="text-xs text-gray-500 mt-1">
            Reservations can be made up to 12 hours in advance.
          </p>
        </div>
        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-lg">
          A non-refundable reservation fee of{" "}
          <span className="font-bold">₹{RESERVATION_FEE}</span> will be charged
          to your wallet.
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            console.log("Cancel button clicked");
            onClose();
          }}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isReserving}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-400"
        >
          {isReserving && <Loader className="w-4 h-4 animate-spin" />}
          {isReserving ? "Confirming..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
};

// --- Filter Modal Component ---
const FilterModal = ({ onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      availability: "all",
      chargerType: "all",
      sortBy: "name",
    };
    setLocalFilters(resetFilters);
  };

  return (
    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600 " />
          Filter Stations
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Availability
          </label>
          <select
            value={localFilters.availability}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, availability: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
          >
            <option value="all">All Stations</option>
            <option value="available">Available Only</option>
            <option value="busy">Busy Stations</option>
            <option value="full">Full Stations</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Charger Type
          </label>
          <select
            value={localFilters.chargerType}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, chargerType: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="all">All Types</option>
            <option value="AC Level 1">AC Level 1</option>
            <option value="AC Level 2">AC Level 2</option>
            <option value="DC Fast Charging">DC Fast Charging</option>
            <option value="DC Ultra-Fast Charging">
              DC Ultra-Fast Charging
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Sort By</label>
          <select
            value={localFilters.sortBy}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, sortBy: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="name">Name (A-Z)</option>
            <option value="availability">Most Available</option>
            <option value="location">Location</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Reset
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW: Contact Admin Modal Component ---
const ContactAdminModal = ({ admin, onClose }) => {
  return (
    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Admin Contact Details
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Contact details for{" "}
        <span className="font-medium text-gray-700">{admin.fullName}</span>.
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-500" />
          <a
            href={`mailto:${admin.email}`}
            className="text-gray-700 hover:text-emerald-600"
          >
            {admin.email}
          </a>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Phone className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            {admin.phoneNumber || "Not provided"}
          </span>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const UserDashboardPage = () => {
  const { authUser, logout } = useAuthStore();

  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(null); // Will store the ID of the reservation being cancelled
  // NEW: State for the contact admin modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    availability: "all", // all, available, busy, full
    chargerType: "all", // all, or specific charger types
    sortBy: "name", // name, availability, location
  });

  const fetchBunks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching bunks...");
      const res = await axiosInstance.get("/bunks/user/bunks");
      console.log("Bunks fetched:", res.data);
      setStations(res.data);
    } catch (error) {
      console.error("Error fetching bunks:", error);
      toast.error("Failed to load available stations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBunks();
  }, []);

  // --- NEW: Memo hook to find user's active reservations ---
  const myActiveReservations = useMemo(() => {
    if (!stations.length || !authUser) return [];

    const reservations = [];
    stations.forEach((station) => {
      station.reservations?.forEach((res) => {
        if (res.userId === authUser._id && res.status === "active") {
          // Add station info to the reservation object for easy access
          reservations.push({
            ...res, // reservation details
            stationName: station.name,
            stationLocation: station.location,
            bunkId: station._id,
          });
        }
      });
    });

    // Sort by ETA
    reservations.sort((a, b) => new Date(a.eta) - new Date(b.eta));

    return reservations;
  }, [stations, authUser]);

  // Search and filter logic
  const filteredAndSortedStations = useMemo(() => {
    let filtered = stations.filter((station) => {
      // Only show active stations
      if (station.status !== "active") return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = station.name.toLowerCase().includes(query);
        const matchesLocation = station.location.toLowerCase().includes(query);
        const matchesChargerType = station.chargerTypes?.some((charger) =>
          charger.type.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesLocation && !matchesChargerType) {
          return false;
        }
      }

      // Availability filter
      if (filters.availability !== "all") {
        const availabilityRatio =
          station.availablePoints / station.chargingPoints;
        switch (filters.availability) {
          case "available":
            if (availabilityRatio < 0.3) return false;
            break;
          case "busy":
            if (availabilityRatio >= 0.3 || station.availablePoints === 0)
              return false;
            break;
          case "full":
            if (station.availablePoints > 0) return false;
            break;
        }
      }

      // Charger type filter
      if (filters.chargerType !== "all") {
        const hasChargerType = station.chargerTypes?.some(
          (charger) => charger.type === filters.chargerType
        );
        if (!hasChargerType) return false;
      }

      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "availability":
          return b.availablePoints - a.availablePoints;
        case "location":
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [stations, searchQuery, filters]);

  // Debounced search function
  const handleSearch = useCallback(() => {
    // Search is handled by the useMemo above, so this is just for the button click
    // You could add additional search logic here if needed
    console.log("Searching for:", searchQuery);
  }, [searchQuery]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilters({
      availability: "all",
      chargerType: "all",
      sortBy: "name",
    });
  };

  const [recentSessions] = useState([
    {
      id: 1,
      station: "Central Mall Station",
      date: "2025-08-14",
      duration: "2.5 hrs",
      cost: "₹180",
    },
    {
      id: 2,
      station: "Tech Park Hub",
      date: "2025-08-12",
      duration: "1.8 hrs",
      cost: "₹130",
    },
    {
      id: 3,
      station: "Airport Station",
      date: "2025-08-10",
      duration: "3.2 hrs",
      cost: "₹240",
    },
  ]);

  const handleOpenModal = (station) => {
    console.log("Opening modal for station:", station);
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setSelectedStation(null);
    setIsModalOpen(false);
  };

  // NEW: Handlers for the contact admin modal
  const handleOpenContactModal = (admin) => {
    setSelectedAdmin(admin);
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedAdmin(null);
    setIsContactModalOpen(false);
  };

  const handleCreateReservation = async (reservationData) => {
    if (!selectedStation) {
      console.error("No station selected");
      return;
    }

    console.log("Creating reservation for station:", selectedStation._id);
    console.log("Reservation data:", reservationData);

    setIsReserving(true);

    try {
      console.log(
        "Making API call to:",
        `/bunks/${selectedStation._id}/reserve`
      );
      const res = await axiosInstance.post(
        `/bunks/${selectedStation._id}/reserve`,
        reservationData
      );

      console.log("API response:", res.data);
      toast.success(res.data.message || "Reservation created successfully!");
      handleCloseModal();
      fetchBunks(); // Refresh the list of stations to show updated availability
    } catch (error) {
      console.error("Reservation error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        "Reservation failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  // --- NEW: Handler for cancelling a reservation ---
  const handleCancelReservation = async (bunkId, reservationId) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this reservation? The reservation fee is non-refundable."
    );
    if (!confirm) return;

    setIsCancelling(reservationId);
    try {
      const res = await axiosInstance.patch(
        `/bunks/${bunkId}/reservations/${reservationId}/cancel`
      );
      toast.success(res.data.message || "Reservation cancelled!");
      fetchBunks(); // Refresh station data to reflect the change
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel reservation.";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({ icon, label, value, unit, color }) => {
    const colors = {
      purple: "bg-purple-100 text-purple-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      emerald: "bg-emerald-100 text-emerald-600",
    };

    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 hover:bg-white/50 transition-all duration-300">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} mb-4`}
        >
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-700 mb-1">
          {value}
          <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>
        </p>
        <p className="text-gray-600 text-sm">{label}</p>
      </div>
    );
  };

  const getAvailabilityStatus = (available, total) => {
    if (available === 0) {
      return { text: "Full", color: "bg-red-100 text-red-700" };
    }
    if (available / total < 0.3) {
      return { text: "Busy", color: "bg-yellow-100 text-yellow-700" };
    }
    return { text: "Available", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 relative">
      {/* Modal overlays */}
      {isModalOpen && selectedStation && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300"
          style={{
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <ReservationModal
            station={selectedStation}
            onClose={handleCloseModal}
            onConfirm={handleCreateReservation}
            isReserving={isReserving}
          />
        </div>
      )}

      {isFilterModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300"
          style={{
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFilterModalOpen(false);
            }
          }}
        >
          <FilterModal
            onClose={() => setIsFilterModalOpen(false)}
            filters={filters}
            onApplyFilters={handleApplyFilters}
          />
        </div>
      )}

      {/* NEW: Contact Admin Modal Overlay */}
      {isContactModalOpen && selectedAdmin && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300"
          style={{
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseContactModal();
            }
          }}
        >
          <ContactAdminModal
            admin={selectedAdmin}
            onClose={handleCloseContactModal}
          />
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-700">
                  EV Charge Hub
                </h1>
                <p className="text-sm text-gray-600">Your charging dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {authUser?.fullName}
                </p>
                <p className="text-xs text-gray-600">Welcome back!</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-light text-gray-700 mb-2">
            Good day,{" "}
            <span className="font-medium text-emerald-600">
              {authUser?.fullName?.split(" ")[0]}
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Ready to power up? Find stations and manage your account below.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                Find Charging Stations
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by station name, location, or charger type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl 
                                 focus:border-emerald-400 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-200
                                 text-gray-700 placeholder-gray-500 transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                    <button
                      onClick={() => setIsFilterModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Active filters display */}
                {(searchQuery ||
                  filters.availability !== "all" ||
                  filters.chargerType !== "all" ||
                  filters.sortBy !== "name") && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {searchQuery && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                        Search: "{searchQuery}"
                      </span>
                    )}
                    {filters.availability !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {filters.availability.charAt(0).toUpperCase() +
                          filters.availability.slice(1)}
                      </span>
                    )}
                    {filters.chargerType !== "all" && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {filters.chargerType}
                      </span>
                    )}
                    {filters.sortBy !== "name" && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        Sort: {filters.sortBy}
                      </span>
                    )}
                    <button
                      onClick={clearSearch}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-sm transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Available Stations
                  {filteredAndSortedStations.length !==
                    stations.filter((s) => s.status === "active").length && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({filteredAndSortedStations.length} of{" "}
                      {stations.filter((s) => s.status === "active").length})
                    </span>
                  )}
                </h3>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : filteredAndSortedStations.length > 0 ? (
                  filteredAndSortedStations.map((station) => {
                    const availability = getAvailabilityStatus(
                      station.availablePoints,
                      station.chargingPoints
                    );
                    return (
                      <div
                        key={station._id}
                        className="bg-white/50 p-4 rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-700 text-lg mb-1">
                              {station.name}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span className="break-words">
                                {station.location}
                              </span>
                            </p>
                            {/* --- MODIFICATION START --- */}
                            {station.operator && (
                              <p className="text-sm text-gray-500 flex items-start gap-1.5 mt-2">
                                <User className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="break-words">
                                  {station.operator.fullName} -{" "}
                                  <button
                                    onClick={() =>
                                      handleOpenContactModal(station.operator)
                                    }
                                    className="text-emerald-600 hover:underline font-medium"
                                  >
                                    Contact Admin
                                  </button>
                                </span>
                              </p>
                            )}
                            {/* --- MODIFICATION END --- */}
                            <div className="border-t border-gray-200 mt-4 pt-3">
                              <h5 className="text-xs font-medium text-gray-500 mb-2">
                                CHARGERS AVAILABLE
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {station.chargerTypes?.map((charger, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs"
                                  >
                                    <p className="font-semibold">
                                      {charger.type}
                                    </p>
                                    <p className="text-gray-600">
                                      {charger.count} points • ₹{charger.price}
                                      /kWh
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-stretch sm:items-end gap-3">
                            <div className="text-left sm:text-right">
                              <p className="font-bold text-gray-700 text-2xl">
                                {station.availablePoints}
                                <span className="text-base font-normal text-gray-500">
                                  /{station.chargingPoints}
                                </span>
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${availability.color}`}
                              >
                                {availability.text}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full">
                              {station.coordinates?.lat && (
                                <button
                                  onClick={() =>
                                    window.open(
                                      `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`,
                                      "_blank"
                                    )
                                  }
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm whitespace-nowrap"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Directions
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  console.log(
                                    "Reserve button clicked for station:",
                                    station
                                  );
                                  handleOpenModal(station);
                                }}
                                disabled={station.availablePoints === 0}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                <CalendarClock className="w-4 h-4" />
                                Reserve a Slot
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Battery className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">
                      {searchQuery ||
                      filters.availability !== "all" ||
                      filters.chargerType !== "all"
                        ? "No stations match your search criteria"
                        : "No Active Stations Found"}
                    </p>
                    <p className="text-sm">
                      {searchQuery ||
                      filters.availability !== "all" ||
                      filters.chargerType !== "all"
                        ? "Try adjusting your search or filters"
                        : "Please check back later or search in a different area."}
                    </p>
                    {(searchQuery ||
                      filters.availability !== "all" ||
                      filters.chargerType !== "all") && (
                      <button
                        onClick={clearSearch}
                        className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                      >
                        Clear Search & Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-8">
            {/* --- NEW: My Reservations section --- */}
            {myActiveReservations.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-emerald-600" />
                  My Active Reservations
                </h3>
                <div className="space-y-4">
                  {myActiveReservations.map((res) => (
                    <div
                      key={res._id}
                      className="p-4 bg-white/50 rounded-xl border border-white/60"
                    >
                      <p className="font-semibold text-gray-800">
                        {res.stationName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {res.stationLocation}
                      </p>
                      <div className="text-sm space-y-1 text-gray-700 border-t pt-2 mt-2">
                        <p>
                          <strong>Charger:</strong> {res.chargerType}
                        </p>
                        <p>
                          <strong>ETA:</strong>{" "}
                          {new Date(res.eta).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCancelReservation(res.bunkId, res._id)
                        }
                        disabled={isCancelling === res._id}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {isCancelling === res._id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4" />
                            Cancel Reservation
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-white/30 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-700 text-sm">
                        {session.station}
                      </h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {session.cost}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{session.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors flex items-center justify-center gap-1">
                View All Sessions
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link to="/profile" className="block">
              <div className="w-full p-4 bg-white/30 hover:bg-white/50 rounded-xl transition-all duration-300 flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700">My Profile</p>
                  <p className="text-xs text-gray-600">Account settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
