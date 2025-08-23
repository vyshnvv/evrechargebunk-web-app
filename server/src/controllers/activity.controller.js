import User from "../models/user.model.js";
import Bunk from "../models/bunk.model.js";

export const getRecentActivity = async (req, res) => {
  try {
    // 1. Fetch recent user registrations
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // .lean() for better performance

    const userActivities = recentUsers.map((user) => ({
      _id: user._id,
      type: "user_registration",
      activityDate: user.createdAt,
      data: {
        fullName: user.fullName,
      },
    }));

    // 2. Fetch recent bunk reservations using an aggregation pipeline
    const recentReservations = await Bunk.aggregate([
      { $unwind: "$reservations" }, // Deconstruct the reservations array
      {
        $match: {
          "reservations.status": "active", // Only get active reservations
        },
      },
      { $sort: { "reservations.createdAt": -1 } }, // Sort by reservation date
      { $limit: 10 },
      {
        // Join with the users collection to get the user's name
        $lookup: {
          from: "users", // The collection to join with
          localField: "reservations.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Deconstruct the userDetails array
      // Project the final shape of the activity data
      {
        $project: {
          _id: "$reservations._id",
          type: { $literal: "bunk_reservation" },
          activityDate: "$reservations.createdAt",
          data: {
            userName: "$userDetails.fullName",
            bunkName: "$name", // The name of the bunk
            chargerType: "$reservations.chargerType",
            eta: "$reservations.eta",
            reservationFee: "$reservations.reservationFee",
          },
        },
      },
    ]);

    // 3. Combine, sort, and limit the final activity feed
    const combinedActivities = [...userActivities, ...recentReservations];

    // Sort all activities by date, newest first
    combinedActivities.sort(
      (a, b) => new Date(b.activityDate) - new Date(a.activityDate)
    );

    // Get the 10 most recent activities overall
    const finalActivities = combinedActivities.slice(0, 10);

    console.log("Recent activities:", finalActivities.length, "items");
    res.json(finalActivities);
  } catch (error) {
    console.error("Error in getRecentActivity:", error);
    res.status(500).json({ message: "Server error" });
  }
};
