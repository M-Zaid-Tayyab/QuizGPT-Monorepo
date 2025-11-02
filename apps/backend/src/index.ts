import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import appFlagsRoutes from "./routes/appFlags";
import authRoutes from "./routes/authRoutes";
import flashcardRoutes from "./routes/flashcardRoutes";
import quizRoutes from "./routes/quizRoutes";
import searchRoutes from "./routes/searchRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/app-flags", appFlagsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
