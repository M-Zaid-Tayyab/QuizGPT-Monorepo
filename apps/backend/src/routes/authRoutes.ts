import express, { RequestHandler } from "express";
import {
  deleteUser,
  editUser,
  forgotPassword,
  getUserDetails,
  login,
  register,
  resetPassword,
  verifyOTP,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import multer from 'multer';
const upload = multer();
const router = express.Router();

router.post("/register", register as RequestHandler);
router.post("/verify-otp", verifyOTP as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/forgot-password", forgotPassword as RequestHandler);
router.post("/reset-password", resetPassword as RequestHandler);
router.get("/user-details", protect as RequestHandler, getUserDetails as RequestHandler);
router.delete("/user", protect as RequestHandler, deleteUser as RequestHandler);
router.put ("/user", protect as RequestHandler,multer().single('image'), editUser as RequestHandler);
export default router;
