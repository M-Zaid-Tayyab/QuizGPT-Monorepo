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
import { anonymousAuthMiddleware } from "../middleware/anonymousAuthMiddleware";

const router = express.Router();

// Configure multer for file uploads
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

// All routes require anonymous authentication
router.use(anonymousAuthMiddleware);

// Flashcard Generation Routes
router.post("/generate", generateFlashcards);
router.post(
  "/generate-from-file",
  upload.single("file"),
  generateFlashcardsFromFile
);
router.post("/generate-from-quiz", generateFlashcardsFromQuiz);

// Deck Management Routes
router.get("/decks", getUserDecks);
router.post("/decks", createDeck);
router.get("/decks/:deckId/flashcards", getDeckFlashcards);

// Study Routes
router.get("/review", getCardsForReview);
router.post("/review/:flashcardId", submitReview);
router.get("/progress", getStudyProgress);

export default router;
