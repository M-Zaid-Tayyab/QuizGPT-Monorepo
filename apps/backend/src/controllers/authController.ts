import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../helpers/emailHelper";
import { uploadToCloudinary } from "../helpers/uploadHelper";
import { AuthRequest } from "../middleware/authMiddleware";
import Quiz from "../models/quizModel";
import { default as User, default as userModel } from "../models/userModel";
dotenv.config();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, age, grade, difficulty, gender } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      age,
      grade,
      difficulty,
      gender,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "100000d",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp?.code !== otp) {
      console.log(user?.otp, otp);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otp?.expiresAt && user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "100000d",
    });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code: otp, expiresAt: otpExpiry };
    await user.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ message: "New password is required" });
      return;
    }

    const user = await userModel.findOne({
      email,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user?.isVerified === false) {
      res.status(400).json({ message: "User is not verified" });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.isVerified = false;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
function hasStreakGap(lastQuizDate: Date | null): boolean {
  if (!lastQuizDate) return false;

  const today = new Date();
  const lastDate = new Date(lastQuizDate);
  const diffInMs = today.getTime() - lastDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  return diffInHours >= 24;
}
export const getUserDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastQuizDate: null,
      };
    }

    if (user.streak.lastQuizDate && hasStreakGap(user.streak.lastQuizDate)) {
      user.streak.current = 0;
      await user.save();
    }

    res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Error getting user stats" });
  }
};
export const editUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { name, age, grade, difficulty, gender } = req.body;
    const file = req.file;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (name) {
      user.name = name;
    }

    if (file) {
      const newImageUrl = await uploadToCloudinary(file.buffer);
      user.image = newImageUrl;
    }

    if (age) {
      user.age = age;
    }

    if (gender) {
      user.gender = gender;
    }

    if (grade) {
      user.grade = grade;
    }

    if (difficulty) {
      user.difficulty = difficulty;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    await Quiz.deleteMany({ createdBy: userId });
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
