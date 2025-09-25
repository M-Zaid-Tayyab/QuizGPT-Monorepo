import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AnonymousAuthRequest } from "../middleware/anonymousAuthMiddleware";
import AnonymousUser from "../models/anonymousUserModel";

dotenv.config();

export const createAnonymousUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      uuid,
      // Pain point data (high conversion impact)
      biggestChallenge,
      studyMethod,
      examConfidence,
      // Study materials (app-specific)
      studyMaterials,
      // Demographic data (personalization)
      age,
      strugglingSubjects,
      // Solution intent (purchase intent confirmation)
      studyNeeds,
      // Legacy fields (backward compatibility)
      grade,
      difficulty,
      gender,
      referral,
      isProUser = false,
    } = req.body;

    if (!uuid) {
      res.status(400).json({ message: "UUID is required" });
      return;
    }

    const existingUser = await AnonymousUser.findById(uuid);
    if (existingUser) {
      res.status(400).json({ message: "UUID already registered" });
      return;
    }

    const user = await AnonymousUser.create({
      _id: uuid,
      // Pain point data (high conversion impact)
      biggestChallenge,
      studyMethod,
      examConfidence,
      // Study materials (app-specific)
      studyMaterials,
      // Demographic data (personalization)
      age,
      strugglingSubjects,
      // Solution intent (purchase intent confirmation)
      studyNeeds,
      // Legacy fields (backward compatibility)
      grade,
      difficulty,
      gender,
      referral,
      isProUser,
    });

    const token = jwt.sign({ uuid: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "100000d",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Error creating anonymous user:", error);
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

export const getAnonymousUserDetails = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;
    const user = await AnonymousUser.findById(userUuid);

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
      quizLimit: 1,
    });
  } catch (error) {
    console.error("Error getting anonymous user stats:", error);
    res.status(500).json({ message: "Error getting anonymous user stats" });
  }
};

export const updateAnonymousUser = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;
    const user = await AnonymousUser.findById(userUuid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const updateData = req.body;
    const allowedFields = [
      "streak",
      "statistics",
      "isProUser",
      // Pain point data
      "biggestChallenge",
      "studyMethod",
      "examConfidence",
      // Study materials
      "studyMaterials",
      // Demographic data
      "age",
      "strugglingSubjects",
      // Solution intent
      "studyNeeds",
      // Legacy fields
      "grade",
      "difficulty",
      "gender",
    ];
    const filteredUpdateData: any = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    Object.assign(user, filteredUpdateData);
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      updatedFields: Object.keys(filteredUpdateData),
    });
  } catch (error) {
    console.error("Error updating anonymous user:", error);
    res.status(500).json({ message: "Error updating anonymous user" });
  }
};
