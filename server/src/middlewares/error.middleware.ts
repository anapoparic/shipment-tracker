import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  if (statusCode === 500) {
    console.error("Unexpected Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
