import mongoose from "mongoose";

// NEW: Define a sub-schema for the different charger types
const chargerTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "AC Level 1",
        "AC Level 2",
        "DC Fast Charging",
        "DC Ultra-Fast Charging",
      ],
    },
    power: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    count: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false } // No separate _id for subdocuments
);

// NEW: Define a sub-schema for reservations
const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chargerType: {
      type: String,
      required: true,
    },
    eta: {
      type: Date,
      required: true,
    },
    reservationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "expired"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Auto-expire reservations after 12 hours if not used
        return new Date(Date.now() + 12 * 60 * 60 * 1000);
      },
    },
  },
  { _id: true } // Keep _id for reservations
);

const bunkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    // Use the chargerTypeSchema to store an array of chargers
    chargerTypes: [chargerTypeSchema],
    chargingPoints: {
      type: Number,
      required: true,
      min: 0, // A station could theoretically have 0 points temporarily
    },
    availablePoints: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // NEW: Add reservations field
    reservations: [reservationSchema],
  },
  { timestamps: true }
);

// Add index for better query performance
bunkSchema.index({ "reservations.userId": 1 });
bunkSchema.index({ "reservations.status": 1 });
bunkSchema.index({ "reservations.expiresAt": 1 });

const Bunk = mongoose.model("Bunk", bunkSchema);

export default Bunk;