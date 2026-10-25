import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
const r = Router();
r.post("/", createOrder);
r.get("/", requireAdmin, listOrders);
r.patch("/:id/status", requireAdmin, updateOrderStatus);
export default r;
