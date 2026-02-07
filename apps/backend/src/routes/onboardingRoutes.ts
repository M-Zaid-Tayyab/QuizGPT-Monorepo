import express from "express";
import { generateOnboardingPreview } from "../controllers/onboardingController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/preview", authenticate as any, generateOnboardingPreview as any);

export default router;
