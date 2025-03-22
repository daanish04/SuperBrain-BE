import { Request, Response, NextFunction } from "express";
const JWT_SECRET = process.env.JWT_SECRET as string;
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

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
  try {
    const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload & {
      id: string;
    };

    if (decoded) {
      req.userId = decoded.id;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } catch (e) {
    res.status(401).json({ message: "Internal Error" });
    return;
  }
};
