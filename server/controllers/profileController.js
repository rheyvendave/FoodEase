import StoreProfile from "../models/StoreProfile.js";

const defaultProfile = {
  branchName: "FoodEase · Mambajao Branch",
  address: "Mambajao, Maasin City, Southern Leyte",
  businessHours: "Monday–Saturday · 8:30 AM–10:00 PM",
  phone: "0909 989 2812",
};

const profileFields = Object.keys(defaultProfile);
const profileMaxLengths = {
  branchName: 100,
  address: 250,
  businessHours: 120,
  phone: 40,
};

function profileResponse(profile) {
  return Object.fromEntries(profileFields.map((field) => [field, profile[field]]));
}

export async function getProfile(_req, res, next) {
  try {
    const profile = await StoreProfile.findOneAndUpdate(
      { key: "main" },
      { $setOnInsert: { key: "main", ...defaultProfile } },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(profileResponse(profile));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updates = {};
    for (const field of profileFields) {
      const value = req.body?.[field];
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({ message: `${field} is required.` });
      }
      if (value.trim().length > profileMaxLengths[field]) {
        return res.status(400).json({
          message: `${field} must be ${profileMaxLengths[field]} characters or fewer.`,
        });
      }
      updates[field] = value.trim();
    }

    const profile = await StoreProfile.findOneAndUpdate(
      { key: "main" },
      { $set: updates, $setOnInsert: { key: "main" } },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(profileResponse(profile));
  } catch (error) {
    next(error);
  }
}
