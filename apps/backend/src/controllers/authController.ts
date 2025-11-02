import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../helpers/uploadHelper";
import { UnifiedAuthRequest } from "../middleware/unifiedAuthMiddleware";
import Quiz from "../models/quizModel";
import { default as userModel } from "../models/userModel";
dotenv.config();

export const socialLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, socialId, socialType, idToken, onboardingData } =
      req.body;

    if (!email || !socialId || !socialType) {
      res.status(400).json({
        message: "Missing required fields: email, socialId, socialType",
      });
      return;
    }

    let user = await userModel.findOne({
      $or: [{ email }, { socialId, socialType }],
    });

    if (user) {
      if (!user.socialId) {
        user.socialId = socialId;
        user.socialType = socialType;
        user.isSocialAuth = true;
      }

      if (onboardingData) {
        user.biggestChallenge = onboardingData.biggestChallenge;
        user.studyMethod = onboardingData.studyMethod;
        user.examConfidence = onboardingData.examConfidence;
        user.studyMaterials = onboardingData.studyMaterials;
        user.age = onboardingData.age;
        user.strugglingSubjects = onboardingData.strugglingSubjects;
        user.studyNeeds = onboardingData.studyNeeds;
      }

      await user.save();
    } else {
      const userData: any = {
        name,
        email,
        socialId,
        socialType,
        isSocialAuth: true,
      };

      if (onboardingData) {
        userData.biggestChallenge = onboardingData.biggestChallenge;
        userData.studyMethod = onboardingData.studyMethod;
        userData.examConfidence = onboardingData.examConfidence;
        userData.studyMaterials = onboardingData.studyMaterials;
        userData.age = onboardingData.age;
        userData.strugglingSubjects = onboardingData.strugglingSubjects;
        userData.studyNeeds = onboardingData.studyNeeds;
      }

      user = await userModel.create(userData);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "100000d",
    });

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({ message: "Social login failed" });
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
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

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

export const updateUser = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const file = req.file;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updateData = req.body;

    delete updateData.email;

    const filteredUpdateData: any = {};
    Object.keys(updateData).forEach((key) => {
      if (key !== "email") {
        filteredUpdateData[key] = updateData[key];
      }
    });

    if (file) {
      const newImageUrl = await uploadToCloudinary(file.buffer);
      filteredUpdateData.image = newImageUrl;
    }

      await userModel.findByIdAndUpdate(userId, filteredUpdateData);

    res.status(200).json({
      message: "User updated successfully",
      updatedFields: Object.keys(filteredUpdateData),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    await Quiz.deleteMany({ createdBy: userId });

      const deletedUser = await userModel.findByIdAndDelete(userId);
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
