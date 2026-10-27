import mongoose from "mongoose";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
const PHILIPPINE_MOBILE_NUMBER = /^(?:09\d{9}|\+639\d{9}|639\d{9})$/;
const FULL_NAME = /^(?:\p{L}[\p{L}\p{M}]*(?:['’-]\p{L}[\p{L}\p{M}]*)*)(?:\s+(?:\p{L}[\p{L}\p{M}]*(?:['’-]\p{L}[\p{L}\p{M}]*)*))+$/u;

export async function createOrder(req, res, next) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ message: "Invalid order details." });
    const {
      customerName,
      phone,
      fulfillment,
      address,
      items,
    } = req.body;
    const normalizedName = typeof customerName === "string"
      ? customerName.trim().replace(/\s+/g, " ")
      : "";
    if (!FULL_NAME.test(normalizedName) || normalizedName.length > 100)
      return res.status(400).json({
        message: "Enter your first and last name using letters. Spaces, hyphens, and apostrophes are allowed.",
      });
    if (typeof phone !== "string" || !PHILIPPINE_MOBILE_NUMBER.test(phone.trim()))
      return res.status(400).json({
        message: "Enter a valid Philippine mobile number (09171234567, +639171234567, or 639171234567).",
      });
    if (!["pickup", "delivery"].includes(fulfillment))
      return res.status(400).json({ message: "Choose pickup or delivery." });
    const orderAddress = fulfillment === "delivery"
      ? typeof address === "string" ? address.trim() : ""
      : "";
    if (fulfillment === "delivery" && (!orderAddress || orderAddress.length > 250))
      return res.status(400).json({ message: "A delivery address is required and must be 250 characters or fewer." });
    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: "Cart is empty." });
    if (items.length > 50)
      return res.status(400).json({ message: "Cart has too many menu items." });
    if (items.some((item) => !item || typeof item !== "object" || Array.isArray(item)
      || !mongoose.isValidObjectId(item.foodId)
      || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50))
      return res.status(400).json({ message: "Invalid food item." });
    const quantitiesByFoodId = new Map();
    for (const item of items) {
      const key = String(item.foodId);
      const quantity = (quantitiesByFoodId.get(key) || 0) + item.quantity;
      if (quantity > 50)
        return res.status(400).json({ message: "Food unavailable or quantity invalid." });
      quantitiesByFoodId.set(key, quantity);
    }
    const foods = await Food.find({
      _id: { $in: items.map((i) => i.foodId) },
      available: true,
    });
    const byId = new Map(foods.map((f) => [String(f._id), f]));
    const clean = [];
    for (const i of items) {
      const f = byId.get(String(i.foodId)),
        q = i.quantity;
      if (!f || !Number.isInteger(q) || q < 1 || q > 50)
        return res
          .status(400)
          .json({ message: "Food unavailable or quantity invalid." });
      clean.push({
        foodId: f._id,
        name: f.name,
        price: f.price,
        imageUrl: typeof f.imageUrl === "string"
          && f.imageUrl.startsWith("data:image/webp;base64,")
          ? ""
          : f.imageUrl || "",
        quantity: q,
      });
    }
    const total = clean.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({
      customerName: normalizedName,
      phone: phone.trim(),
      fulfillment,
      address: orderAddress,
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

export function getSalesPeriodRange(period, now = new Date()) {
  if (!["today", "last7days", "thisMonth"].includes(period)) return null;
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const manilaOffset = 8 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;
  let startAt = Date.UTC(year, month - 1, day) - manilaOffset;
  if (period === "last7days") startAt -= 6 * dayMs;
  if (period === "thisMonth") startAt = Date.UTC(year, month - 1, 1) - manilaOffset;
  return { from: new Date(startAt), to: now };
}

export async function getSalesSummary(req, res, next) {
  try {
    const range = getSalesPeriodRange(req.query.period);
    if (!range)
      return res.status(400).json({ message: "Choose today, the last 7 days, or this month." });
    const [summary] = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $addFields: { salesDate: { $ifNull: ["$completedAt", "$createdAt"] } } },
      { $match: { salesDate: { $gte: range.from, $lte: range.to } } },
      {
        $group: {
          _id: null,
          completedOrders: { $sum: 1 },
          totalSales: { $sum: "$total" },
        },
      },
    ]);
    res.set("Cache-Control", "no-store");
    return res.json({
      period: req.query.period,
      completedOrders: summary?.completedOrders || 0,
      totalSales: summary?.totalSales || 0,
    });
  } catch (error) {
    return next(error);
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
    const currentOrder = await Order.findById(req.params.id);
    if (!currentOrder) return res.status(404).json({ message: "Order not found." });
    const update = { $set: { status: req.body.status } };
    if (req.body.status === "Completed") {
      if (currentOrder.status !== "Completed")
        update.$set.completedAt = new Date();
    } else if (currentOrder.status === "Completed") {
      update.$unset = { completedAt: "" };
    }
    const o = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true },
    );
    if (!o) return res.status(404).json({ message: "Order not found." });
    res.json(o);
  } catch (e) {
    next(e);
  }
}
