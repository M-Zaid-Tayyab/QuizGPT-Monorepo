import express from "express";
import multer from "multer";
import {
  createDeck,
  deleteDeck,
  generateFlashcards,
  generateFlashcardsFromFile,
  generateFlashcardsFromQuiz,
  getDeckFlashcards,
  getUserDecks,
} from "../controllers/flashcardController";
import { authenticate } from "../middleware/authMiddleware";

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

router.use(authenticate as any);

router.post("/generate", generateFlashcards as any);
router.post(
  "/generate-from-file",
  upload.single("file"),
  generateFlashcardsFromFile as any
);
router.post("/generate-from-quiz", generateFlashcardsFromQuiz as any);

router.get("/decks", getUserDecks as any);
router.post("/decks", createDeck as any);
router.get("/decks/:deckId/flashcards", getDeckFlashcards as any);
router.delete("/decks/:deckId", deleteDeck as any);

export default router;
