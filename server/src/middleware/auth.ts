import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedUser, UserRole } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!JWT_SECRET) {
    return res.status(500).json({
      error: "Authentication is not configured",
    });
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token required",
    });
  }

  try {
    const token = authorization.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      !["Admin", "Lead", "Member"].includes(String(decoded.role))
    ) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    if (!Number.isSafeInteger(req.user.id) || req.user.id <= 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

export function allowRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    return next();
  };
}
