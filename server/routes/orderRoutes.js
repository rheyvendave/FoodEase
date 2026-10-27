import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createOrder,
  deleteOrder,
  getSalesSummary,
  listOrders,
  updateOrderCustomerDetails,
  updateOrderStatus,
} from "../controllers/orderController.js";
const r = Router();
r.post("/", createOrder);
r.get("/sales-summary", requireAdmin, getSalesSummary);
r.get("/", requireAdmin, listOrders);
r.patch("/:id/customer", requireAdmin, updateOrderCustomerDetails);
r.patch("/:id/status", requireAdmin, updateOrderStatus);
r.delete("/:id", requireAdmin, deleteOrder);
export default r;
