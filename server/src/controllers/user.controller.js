import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
// This is your existing function
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    });
    const stats = {
      totalUsers,
      recentUsers,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
    res.json(stats);
  } catch (error) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- ADD THIS NEW FUNCTION ---
// Get recent user registrations
export const getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(5) // Limit to the 5 most recent users
      .select("fullName createdAt"); // Select only the fields you need

    res.json(recentUsers);
  } catch (error) {
    console.error("Error in getRecentUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required." });
  }

  const user = await User.findById(req.user._id);

  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long." });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } else {
    res.status(401).json({ message: "Invalid current password" });
  }
};
