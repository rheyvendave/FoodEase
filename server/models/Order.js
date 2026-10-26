import mongoose from "mongoose";
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
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    fulfillment: { type: String, enum: ["pickup", "delivery"], required: true },
    address: { type: String, default: "" },
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
  },
  { timestamps: true },
);
export default mongoose.model("Order", schema);
