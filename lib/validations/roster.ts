import { z } from "zod";

export const AddCreatorToRosterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  /** URL-safe handle e.g. "janedoe". Must be unique across all creators. */
  handle: z
    .string()
    .min(1, "Handle is required")
    .regex(/^[a-z0-9_-]+$/, "Handle must be lowercase alphanumeric, _ or -"),
  platform: z.string().min(1, "Platform is required"),
  email: z.string().email("Must be a valid email").optional(),
});

export type AddCreatorToRosterInput = z.infer<typeof AddCreatorToRosterSchema>;
