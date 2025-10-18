import { z } from "zod"

export const submitHarvestSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  harvestDate: z.string().datetime("Invalid harvest date format"),
  yieldAmount: z.number().min(0.1, "Yield amount must be positive"),
  yieldUnit: z.enum(["tons", "kg", "bags"], {
    errorMap: () => ({ message: "Invalid yield unit" }),
  }),
  qualityGrade: z.enum(["A", "B", "C"], {
    errorMap: () => ({ message: "Quality grade must be A, B, or C" }),
  }),
  storageLocation: z.string().min(2, "Storage location is required").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  documents: z.array(z.string().url()).optional(),
})

export const updateHarvestSchema = submitHarvestSchema.partial()
