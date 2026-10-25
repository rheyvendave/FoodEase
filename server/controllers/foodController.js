import mongoose from "mongoose";
import Food from "../models/Food.js";
export async function listFoods(req, res, next) {
  try {
    const { search = "", category = "" } = req.query;
    const filter = {};
    if (req.query.includeUnavailable !== "true") filter.available = true;
    if (category && category !== "All") filter.category = category;
    if (search.trim()) filter.$text = { $search: search.trim() };
    res.json(await Food.find(filter).sort({ category: 1, name: 1 }).limit(100));
  } catch (e) {
    next(e);
  }
}
export async function getFood(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid food ID." });
    const f = await Food.findById(req.params.id);
    if (!f) return res.status(404).json({ message: "Food not found." });
    res.json(f);
  } catch (e) {
    next(e);
  }
}
export async function createFood(req, res, next) {
  try {
    const {
      name,
      description = "",
      category,
      price,
      imageUrl = "",
      available = true,
    } = req.body || {};
    if (
      !name?.trim() ||
      !category?.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    )
      return res
        .status(400)
        .json({ message: "Name, category, and valid price are required." });
    res
      .status(201)
      .json(
        await Food.create({
          name,
          description,
          category,
          price: Number(price),
          imageUrl,
          available,
        }),
      );
  } catch (e) {
    next(e);
  }
}
export async function updateFood(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid food ID." });
    const updates = {};
    for (const k of [
      "name",
      "description",
      "category",
      "price",
      "imageUrl",
      "available",
    ])
      if (req.body?.[k] !== undefined) updates[k] = req.body[k];
    if (updates.price !== undefined) {
      if (!Number.isFinite(Number(updates.price)) || Number(updates.price) < 0)
        return res.status(400).json({ message: "Invalid price." });
      updates.price = Number(updates.price);
    }
    const f = await Food.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!f) return res.status(404).json({ message: "Food not found." });
    res.json(f);
  } catch (e) {
    next(e);
  }
}
export async function deleteFood(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid food ID." });
    const f = await Food.findByIdAndDelete(req.params.id);
    if (!f) return res.status(404).json({ message: "Food not found." });
    res.json({ message: "Food deleted." });
  } catch (e) {
    next(e);
  }
}
