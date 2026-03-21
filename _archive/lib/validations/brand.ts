import { z } from "zod";

// Brand model has: id, name, website?, logoUrl? — no notes field in schema
export const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  website: z.string().url("Must be a valid URL").optional(),
});

export const UpdateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url("Must be a valid URL").nullable().optional(),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
