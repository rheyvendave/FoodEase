import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = Router();
router.use(requireAdmin);
router.get("/", getProfile);
router.put("/", updateProfile);

export default router;
