import mongoose from "mongoose";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
export async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      phone,
      fulfillment,
      address = "",
      items,
    } = req.body || {};
    if (!customerName?.trim() || !phone?.trim())
      return res.status(400).json({ message: "Name and phone are required." });
    if (!["pickup", "delivery"].includes(fulfillment))
      return res.status(400).json({ message: "Choose pickup or delivery." });
    if (fulfillment === "delivery" && !address.trim())
      return res.status(400).json({ message: "Delivery address is required." });
    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: "Cart is empty." });
    if (items.some((i) => !mongoose.isValidObjectId(i.foodId)))
      return res.status(400).json({ message: "Invalid food item." });
    const foods = await Food.find({
      _id: { $in: items.map((i) => i.foodId) },
      available: true,
    });
    const byId = new Map(foods.map((f) => [String(f._id), f]));
    const clean = [];
    for (const i of items) {
      const f = byId.get(String(i.foodId)),
        q = Number(i.quantity);
      if (!f || !Number.isInteger(q) || q < 1 || q > 50)
        return res
          .status(400)
          .json({ message: "Food unavailable or quantity invalid." });
      clean.push({
        foodId: f._id,
        name: f.name,
        price: f.price,
        imageUrl: f.imageUrl,
        quantity: q,
      });
    }
    const total = clean.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({
      customerName,
      phone,
      fulfillment,
      address: fulfillment === "delivery" ? address : "",
      paymentMethod: "cash",
      items: clean,
      total,
    });
    res.status(201).json({ message: "Order placed.", order });
  } catch (e) {
    next(e);
  }
}
export async function listOrders(_req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    const foodIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items
            .filter((item) => !item.imageUrl && item.foodId)
            .map((item) => String(item.foodId)),
        ),
      ),
    ];
    const foods = foodIds.length
      ? await Food.find({ _id: { $in: foodIds } }).select("_id imageUrl")
      : [];
    const imageByFoodId = new Map(
      foods.map((food) => [String(food._id), food.imageUrl]),
    );

    res.json(
      orders.map((order) => {
        const data = order.toObject();
        data.items = data.items.map((item) => ({
          ...item,
          imageUrl: item.imageUrl || imageByFoodId.get(String(item.foodId)) || "",
        }));
        return data;
      }),
    );
  } catch (e) {
    next(e);
  }
}
export async function updateOrderStatus(req, res, next) {
  try {
    const allowed = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready",
      "Out for delivery",
      "Completed",
      "Cancelled",
    ];
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid order ID." });
    if (!allowed.includes(req.body?.status))
      return res.status(400).json({ message: "Invalid status." });
    const o = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!o) return res.status(404).json({ message: "Order not found." });
    res.json(o);
  } catch (e) {
    next(e);
  }
}
