import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.statusCode || 500;
  const message = err.message || "Произошла ошибка на сервере";

  console.error("Обработчик ошибок: ", err.message || err);
  res
    .status(status)
    .json({ message, error: err });
}
