import express from "express";
import { getFeed } from "../controllers/feedController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate as any, getFeed as any);

export default router;
