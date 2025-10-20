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
    return res.status(401).json({ message: "Не авторизован" });
  }

  const token = authHeader.substring(7, authHeader.length);
  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    console.log('authMiddleware', "decoded:", decoded);

    req.user = { id: decoded.userId, role: decoded.userRole };
    
    console.log("req.user:", req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Авторизация отклонена, не действительный токен" });
  }
};

export const adminOrOwnerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!req.user)
    return res.status(401).json({ message: "Пользователь не авторизован" });

  console.log('adminOrOwnerMiddleware', "user:", req.user);

  if (req.user.role === "admin") {
    return next();
  }
  if (req.user.id === id) {
    return next();
  }

  
  console.log("req.user.id:", req.user.id, "req.params.id:", id);
  return res.status(403).json({ message: "Доступ запрещен" });
};
