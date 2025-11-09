import express from "express";
import multer from "multer";
import {
  deleteQuiz,
  explainAnswer,
  generateCustomQuiz,
  getQuizHistory,
  submitQuizResult,
} from "../controllers/quizController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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

router.post(
  "/generate",
  authenticate as any,
  upload.single("file"),
  handleMulterError,
  generateCustomQuiz as any
);
router.post(
  "/generate-custom",
  authenticate as any,
  upload.single("file"),
  handleMulterError,
  generateCustomQuiz as any
);
router.post("/submit", authenticate as any, submitQuizResult as any);
router.get("/history", authenticate as any, getQuizHistory as any);
router.post("/explain-answer", authenticate as any, explainAnswer as any);
router.delete("/:quizId", authenticate as any, deleteQuiz as any);

export default router;
