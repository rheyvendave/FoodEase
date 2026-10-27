import mongoose from "mongoose";
import Food from "../models/Food.js";

const MAX_IMAGE_DATA_URL_LENGTH = 615_000;
const MAX_IMAGE_BYTES = 450 * 1024;
const FOOD_CATEGORIES = ["Dessert", "Drinks", "Merienda", "Sulit Meals", "Ulam"];
const imageDataUrlPattern = /^data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})$/;

function isValidImageUrl(imageUrl) {
  if (typeof imageUrl !== "string") return false;
  if (!imageUrl) return true;
  if (!imageUrl.startsWith("data:")) return imageUrl.length <= 2048;

  const match = imageDataUrlPattern.exec(imageUrl);
  if (!match || imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH) return false;
  const image = Buffer.from(match[1], "base64");
  return image.length <= MAX_IMAGE_BYTES
    && image.toString("ascii", 0, 4) === "RIFF"
    && image.toString("ascii", 8, 12) === "WEBP";
}

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
      !FOOD_CATEGORIES.includes(category) ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    )
      return res
        .status(400)
        .json({ message: "Name, a supported category, and valid price are required." });
    if (!isValidImageUrl(imageUrl))
      return res.status(400).json({ message: "Choose a valid image no larger than 450 KB." });
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
    if (updates.category !== undefined && !FOOD_CATEGORIES.includes(updates.category))
      return res.status(400).json({ message: "Choose a supported food category." });
    if (updates.imageUrl !== undefined && !isValidImageUrl(updates.imageUrl))
      return res.status(400).json({ message: "Choose a valid image no larger than 450 KB." });
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
