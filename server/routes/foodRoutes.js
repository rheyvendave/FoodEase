import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  listFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";
const r = Router();
r.get("/", listFoods);
r.get("/:id", getFood);
r.post("/", requireAdmin, createFood);
r.put("/:id", requireAdmin, updateFood);
r.delete("/:id", requireAdmin, deleteFood);
export default r;
