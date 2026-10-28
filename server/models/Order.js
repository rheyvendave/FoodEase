import mongoose from "mongoose";
import { deliveryBarangays } from "../deliveryBarangays.js";
const item = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    name: String,
    price: Number,
    imageUrl: { type: String, default: "" },
    quantity: { type: Number, min: 1, required: true },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: [
        /^(?:\p{L}[\p{L}\p{M}]*(?:['’-]\p{L}[\p{L}\p{M}]*)*)(?:\s+(?:\p{L}[\p{L}\p{M}]*(?:['’-]\p{L}[\p{L}\p{M}]*)*))+$/u,
        "Enter a valid first and last name.",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^(?:09\d{9}|\+639\d{9}|639\d{9})$/, "Enter a valid Philippine mobile number."],
    },
    fulfillment: { type: String, enum: ["pickup", "delivery"], required: true },
    barangay: { type: String, enum: ["", ...deliveryBarangays], default: "" },
    address: {
      type: String,
      trim: true,
      default: "",
      required: function () {
        return this.fulfillment === "delivery";
      },
    },
    deliveryFee: { type: Number, min: 0, default: 0 },
    paymentMethod: { type: String, default: "cash", enum: ["cash"] },
    items: { type: [item], validate: (v) => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Out for delivery",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ status: 1, completedAt: 1 });
export default mongoose.model("Order", schema);
