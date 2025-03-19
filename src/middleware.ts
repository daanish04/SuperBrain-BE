import { Request, Response, NextFunction } from "express";
const JWT_SECRET = process.env.JWT_SECRET as string;
import jwt from "jsonwebtoken";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({
      message: "Token missing. Unauthorized",
    });
  }
  const decoded = jwt.verify(token as string, JWT_SECRET);

  if (decoded) {
    // @ts-ignore
    (req as any).userId = decoded.id;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
