import express from "express";
import multer from "multer";
import {
  deleteQuiz,
  explainAnswer,
  generateCustomQuiz,
  getQuizHistory,
  submitQuizResult,
} from "../controllers/quizController";
import { protectUnified } from "../middleware/unifiedAuthMiddleware";

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
  protectUnified,
  upload.single("file"),
  handleMulterError,
  generateCustomQuiz
);
router.post(
  "/generate-custom",
  protectUnified,
  upload.single("file"),
  handleMulterError,
  generateCustomQuiz
);
router.post("/submit", protectUnified, submitQuizResult);
router.get("/history", protectUnified, getQuizHistory);
router.post("/explain-answer", protectUnified, explainAnswer);
router.delete("/:quizId", protectUnified, deleteQuiz);

export default router;
