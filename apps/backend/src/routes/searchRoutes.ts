import express from "express";
import { searchStudySets } from "../controllers/searchController";
import { protectUnified } from "../middleware/unifiedAuthMiddleware";

const router = express.Router();

router.get("/", protectUnified, searchStudySets);

export default router;

