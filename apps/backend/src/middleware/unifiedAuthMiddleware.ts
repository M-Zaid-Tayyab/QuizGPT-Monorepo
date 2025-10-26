import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AnonymousUser from "../models/anonymousUserModel";
import userModel from "../models/userModel";

interface UserJwtPayload {
  id: string;
}

interface AnonymousJwtPayload {
  uuid: string;
}

export interface UnifiedAuthRequest extends Request {
  user?: any;
  userType?: "user" | "anonymous";
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

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as UserJwtPayload;

      const user = await userModel.findById(decoded.id);

      if (user) {
        req.user = user;
        req.userType = "user";
        next();
        return;
      }
    } catch (userError) {}

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as AnonymousJwtPayload;

      const user = await AnonymousUser.findById(decoded.uuid);

      if (user) {
        req.user = user;
        req.userType = "anonymous";
        next();
        return;
      }
    } catch (anonymousError) {}

    res.status(401).json({ message: "Not authorized" });
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export interface AnonymousAuthRequest extends Request {
  anonymousUser?: any;
  file?: Express.Multer.File;
}

export const protectAnonymous = async (
  req: AnonymousAuthRequest,
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
    ) as AnonymousJwtPayload;

    req.anonymousUser = await AnonymousUser.findById(decoded.uuid);

    if (!req.anonymousUser) {
      res
        .status(401)
        .json({ message: "User not found. Please create a new account." });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export const anonymousAuthMiddleware = protectAnonymous;
