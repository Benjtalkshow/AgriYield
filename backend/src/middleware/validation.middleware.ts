import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        })
      }
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      })
    }
  }
}
