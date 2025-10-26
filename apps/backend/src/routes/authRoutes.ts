import express from "express";

import {
  createAnonymousUser,
  deleteUser,
  getUserDetails,
  socialLogin,
  updateUser,
} from "../controllers/authController";
import { protectUnified } from "../middleware/unifiedAuthMiddleware";

const router = express.Router();

router.post("/social-login", socialLogin);
router.post("/anonymous-register", createAnonymousUser);
router.get("/user", protectUnified, getUserDetails);
router.put("/user", protectUnified, updateUser);
router.delete("/user", protectUnified, deleteUser);

export default router;
