import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = Router();
router.get("/", getProfile);
router.put("/", requireAdmin, updateProfile);

export default router;
