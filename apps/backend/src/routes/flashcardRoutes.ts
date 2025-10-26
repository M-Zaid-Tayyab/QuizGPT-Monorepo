import express from "express";
import multer from "multer";
import {
  createDeck,
  generateFlashcards,
  generateFlashcardsFromFile,
  generateFlashcardsFromQuiz,
  getCardsForReview,
  getDeckFlashcards,
  getStudyProgress,
  getUserDecks,
  submitReview,
} from "../controllers/flashcardController";
import { protectUnified } from "../middleware/unifiedAuthMiddleware";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and image files are allowed."));
    }
  },
});

router.use(protectUnified);

router.post("/generate", generateFlashcards);
router.post(
  "/generate-from-file",
  upload.single("file"),
  generateFlashcardsFromFile
);
router.post("/generate-from-quiz", generateFlashcardsFromQuiz);

router.get("/decks", getUserDecks);
router.post("/decks", createDeck);
router.get("/decks/:deckId/flashcards", getDeckFlashcards);

router.get("/review", getCardsForReview);
router.post("/review/:flashcardId", submitReview);
router.get("/progress", getStudyProgress);

export default router;
