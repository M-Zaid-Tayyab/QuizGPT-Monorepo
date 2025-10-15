import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AnonymousUser from "../models/anonymousUserModel";

interface AnonymousJwtPayload {
  uuid: string;
}

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

// Export as anonymousAuthMiddleware for backward compatibility
export const anonymousAuthMiddleware = protectAnonymous;
