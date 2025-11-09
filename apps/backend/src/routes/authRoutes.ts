import express from "express";

import {
  deleteUser,
  getUserDetails,
  socialLogin,
  updateUser,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/social-login", socialLogin);
router.get("/user", authenticate as any, getUserDetails as any);
router.put("/user", authenticate as any, updateUser as any);
router.delete("/user", authenticate as any, deleteUser as any);

export default router;
