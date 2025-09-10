import express from "express";
import { generateQuiz, submitQuizResult, getQuizHistory } from "../controllers/quizController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/generate", protect, generateQuiz);
router.post("/submit", protect, submitQuizResult);
router.get("/history", protect, getQuizHistory);

export default router;