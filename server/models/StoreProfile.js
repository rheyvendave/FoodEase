import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    branchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "FoodEase · Mambajao Branch",
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
      default: "Mambajao, Maasin City, Southern Leyte",
    },
    businessHours: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Monday–Saturday · 8:30 AM–10:00 PM",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      default: "0909 989 2812",
    },
  },
  { timestamps: true },
);

export default mongoose.model("StoreProfile", schema);
