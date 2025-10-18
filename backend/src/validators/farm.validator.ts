import { z } from "zod"

const baseFarmSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters").max(100, "Farm name too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().default("Nigeria"),
    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90, "Invalid latitude"),
        longitude: z.number().min(-180).max(180, "Invalid longitude"),
      })
      .optional(),
  }),
  farmType: z.enum(["crop", "livestock", "mixed", "poultry", "fishery"], {
    errorMap: () => ({ message: "Invalid farm type" }),
  }),
  totalArea: z.number().min(0.1, "Total area must be at least 0.1 hectares"),
  cultivatedArea: z.number().min(0.1, "Cultivated area must be at least 0.1 hectares"),
  irrigationType: z.enum(["rainfed", "irrigated", "supplemental"], {
    errorMap: () => ({ message: "Invalid irrigation type" }),
  }),
  crops: z.array(z.string()).min(1, "At least one crop is required"),
  expectedYield: z.number().min(0, "Expected yield must be positive"),
  plantingDate: z.string().datetime().optional(),
  harvestDate: z.string().datetime().optional(),
  images: z.array(z.string().url()).optional(),
  documents: z.array(z.string().url()).optional(),
})

export const createFarmSchema = baseFarmSchema.refine(
  (data) => data.cultivatedArea <= data.totalArea,
  {
    message: "Cultivated area cannot exceed total area",
    path: ["cultivatedArea"],
  }
)

export const updateFarmSchema = baseFarmSchema.partial().refine(
  (data) =>
    data.cultivatedArea === undefined ||
    data.totalArea === undefined ||
    data.cultivatedArea <= data.totalArea,
  {
    message: "Cultivated area cannot exceed total area",
    path: ["cultivatedArea"],
  }
)
