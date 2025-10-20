import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  userRole: "admin" | "user";
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "admin" | "user";
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next({ status: 401, message: "Не авторизован, не действительный токен" });
  }

  const token = authHeader.substring(7, authHeader.length);

  const secret = process.env.JWT_SECRET || "secret";
  const decoded = jwt.verify(token, secret) as JwtPayload;

  console.log("authMiddleware", "decoded:", decoded);

  req.user = { id: decoded.userId, role: decoded.userRole };

  console.log("req.user:", req.user);
  next();
};

export const adminOrOwnerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!req.user)
    return next({ status: 401, message: "Пользователь не авторизован" });

  console.log("adminOrOwnerMiddleware", "user:", req.user);

  if (req.user.role === "admin") {
    return next();
  }
  if (req.user.id === id) {
    return next();
  }

  console.log("req.user.id:", req.user.id, "req.params.id:", id);
  return next({ status: 403, message: "Доступ запрещен" });
};
