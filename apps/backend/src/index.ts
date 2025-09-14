import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import anonymousAuthRoutes from "./routes/anonymousAuthRoutes";
import anonymousQuizRoutes from "./routes/anonymousQuizRoutes";
import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quizRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/anonymous/auth", anonymousAuthRoutes);
app.use("/api/anonymous/quiz", anonymousQuizRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
