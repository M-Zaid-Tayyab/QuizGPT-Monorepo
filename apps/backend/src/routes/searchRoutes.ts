import express from "express";
import { searchStudySets } from "../controllers/searchController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate as any, searchStudySets as any);

export default router;
