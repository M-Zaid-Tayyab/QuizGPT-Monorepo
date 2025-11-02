import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";

interface UserJwtPayload {
  id: string;
}

export interface UnifiedAuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const protectUnified = async (
  req: UnifiedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as UserJwtPayload;

      const user = await userModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};
