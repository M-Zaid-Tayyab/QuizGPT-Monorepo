import express from "express";
import multer from "multer";
import {
  continueLearning,
  explainAnswer,
  generateAnonymousQuiz,
  getAnonymousQuizHistory,
  submitAnonymousQuizResult,
} from "../controllers/anonymousQuizController";
import { protectAnonymous } from "../middleware/anonymousAuthMiddleware";

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  },
});

const handleMulterError = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res
        .status(400)
        .json({ message: "File size too large. Maximum size is 10MB." });
      return;
    }
    res.status(400).json({ message: "File upload error: " + error.message });
    return;
  }

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  next();
};

router.use(protectAnonymous);

router.get("/generate", generateAnonymousQuiz);
router.post(
  "/generate",
  upload.single("file"),
  handleMulterError,
  generateAnonymousQuiz
);
router.post("/submit", submitAnonymousQuizResult);
router.get("/history", getAnonymousQuizHistory);
router.post("/continue-learning", continueLearning);
router.post("/explain-answer", explainAnswer);

export default router;
