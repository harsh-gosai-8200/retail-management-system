import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Product name is required").max(100, "Product name is too long"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  skuCode: z.string().min(1, "SKU Code is required"),
  stockQuantity: z.coerce.number().int().nonnegative("Stock cannot be negative"), // API uses stockQuantity
  unit: z.enum(["kg", "liter", "piece", "box", "packet", "carton", "dozen", "gms", "ml"]), // Added more units
  wholesalerId: z.coerce.number().positive("Wholesaler ID is required"),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

