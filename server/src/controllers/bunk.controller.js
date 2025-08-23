import Bunk from "../models/bunk.model.js";

export const createBunk = async (req, res) => {
  try {
    const { name, location, status, coordinates, chargerTypes } = req.body;

    // Validate that chargerTypes exists and is an array
    if (
      !chargerTypes ||
      !Array.isArray(chargerTypes) ||
      chargerTypes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one charger type is required." });
    }

    // Calculate total charging points from the array of chargers
    const totalPoints = chargerTypes.reduce(
      (sum, charger) => sum + Number(charger.count), // FIX: Added '+' operator
      0
    );

    const bunk = new Bunk({
      name,
      location,
      coordinates,
      chargerTypes,
      chargingPoints: totalPoints,
      availablePoints: totalPoints, // Initially, all points are available
      status,
      operator: req.user._id,
      reservations: [], // Initialize empty reservations array
    });

    await bunk.save();
    res.status(201).json(bunk);
  } catch (error) {
    console.error("Error in createBunk:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getBunks = async (req, res) => {
  try {
    const bunks = await Bunk.find().populate("operator", "fullName email");
    res.json(bunks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBunk = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If chargerTypes is being updated, recalculate total charging points
    if (updateData.chargerTypes && Array.isArray(updateData.chargerTypes)) {
      updateData.chargingPoints = updateData.chargerTypes.reduce(
        (sum, charger) => sum + Number(charger.count), // FIX: Added '+' operator
        0
      );
      // Note: A more complex logic would be needed to handle availablePoints accurately during an update.
      // For simplicity, we are resetting it to the new total.
      updateData.availablePoints = updateData.chargingPoints;
    }

    const bunk = await Bunk.findByIdAndUpdate(id, updateData, { new: true });

    if (!bunk) {
      return res.status(404).json({ message: "Bunk not found" });
    }

    res.json(bunk);
  } catch (error) {
    console.error("Error in updateBunk:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteBunk = async (req, res) => {
  try {
    await Bunk.findByIdAndDelete(req.params.id);
    res.json({ message: "Bunk deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get bunks for the user dashboard
export const getUserBunks = async (req, res) => {
  try {
    // MODIFIED: Added "phoneNumber" to the populate method
    const bunks = await Bunk.find().populate(
      "operator",
      "fullName email phoneNumber"
    );
    res.json(bunks);
  } catch (error) {
    console.error("Error in getUserBunks:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { bunkId } = req.params;
    const { chargerType, eta, reservationFee } = req.body;
    const userId = req.user._id;

    console.log("Creating reservation with data:", {
      bunkId,
      chargerType,
      eta,
      reservationFee,
      userId,
    });

    // Validate required fields
    if (!chargerType || !eta || reservationFee === undefined) {
      return res.status(400).json({
        message: "Charger type, ETA, and reservation fee are required.",
      });
    }

    // Validate ETA format and ensure it's in the future
    const etaDate = new Date(eta);
    if (isNaN(etaDate.getTime())) {
      return res.status(400).json({ message: "Invalid ETA format." });
    }

    if (etaDate <= new Date()) {
      return res.status(400).json({ message: "ETA must be in the future." });
    }

    // Find the bunk
    const bunk = await Bunk.findById(bunkId);
    if (!bunk) {
      return res.status(404).json({ message: "Station not found." });
    }

    // Check if station is active
    if (bunk.status !== "active") {
      return res
        .status(400)
        .json({ message: "Station is not currently active." });
    }

    // Check available points
    if (bunk.availablePoints <= 0) {
      return res
        .status(400)
        .json({ message: "No available charging points to reserve." });
    }

    // Validate that the charger type exists at this station
    const hasChargerType = bunk.chargerTypes.some(
      (charger) => charger.type === chargerType
    );
    if (!hasChargerType) {
      return res.status(400).json({
        message: "Selected charger type is not available at this station.",
      });
    }

    // Check if user already has an active reservation at this station
    const existingReservation = bunk.reservations.find(
      (reservation) =>
        reservation.userId.toString() === userId.toString() &&
        reservation.status === "active"
    );

    if (existingReservation) {
      return res.status(400).json({
        message: "You already have an active reservation at this station.",
      });
    }

    // Create the reservation
    const newReservation = {
      userId,
      chargerType,
      eta: etaDate,
      reservationFee: Number(reservationFee),
      status: "active",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    };

    // Add reservation and decrement available points
    bunk.reservations.push(newReservation);
    bunk.availablePoints -= 1;

    await bunk.save();

    console.log("Reservation created successfully:", newReservation);

    res.status(201).json({
      message: `Slot reserved successfully at ${
        bunk.name
      }! Please arrive by ${etaDate.toLocaleString()}.`,
      reservation: newReservation,
      bunk: {
        id: bunk._id,
        name: bunk.name,
        availablePoints: bunk.availablePoints,
      },
    });
  } catch (error) {
    console.error("Error in createReservation:", error);
    res.status(500).json({
      message: "Failed to create reservation. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { bunkId, reservationId } = req.params;
    const user = req.user;

    console.log(`Cancelling reservation ${reservationId} for bunk ${bunkId}`);

    const bunk = await Bunk.findById(bunkId);
    if (!bunk) {
      return res.status(404).json({ message: "Station not found." });
    }

    // Use the .id() method to find the subdocument by its _id
    const reservation = bunk.reservations.id(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Security check: Allow cancellation if the user is an admin OR owns the reservation
    if (
      user.role !== "admin" &&
      reservation.userId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to cancel this reservation.",
      });
    }

    if (reservation.status !== "active") {
      return res.status(400).json({
        message: `Cannot cancel a reservation with status: ${reservation.status}.`,
      });
    }

    reservation.status = "cancelled";
    bunk.availablePoints += 1; // Free up the spot

    await bunk.save();
    res.status(200).json({ message: "Reservation cancelled successfully." });
  } catch (error) {
    console.error("Error in cancelReservation:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel reservation. Please try again." });
  }
};
