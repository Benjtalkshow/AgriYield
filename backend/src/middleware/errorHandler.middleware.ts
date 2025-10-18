import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const status = `${statusCode}`.startsWith("4") ? "fail" : "error"
  const message = err.message || "Something went wrong"

  console.error("Error:", err)

  res.status(statusCode).json({
    status,
    statusCode,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  })
}
