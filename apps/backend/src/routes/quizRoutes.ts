import express from "express";
import multer from "multer";
import {
  generateCustomQuiz,
  generateQuiz,
  getQuizHistory,
  submitQuizResult,
} from "../controllers/quizController";
import { protect } from "../middleware/authMiddleware";

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

router.get("/generate", protect, generateQuiz);
router.post(
  "/generate-custom",
  protect,
  upload.single("file"),
  handleMulterError,
  generateCustomQuiz
);
router.post("/submit", protect, submitQuizResult);
router.get("/history", protect, getQuizHistory);

export default router;
