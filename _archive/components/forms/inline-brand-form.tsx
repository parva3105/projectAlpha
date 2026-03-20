"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InlineBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  website: z
    .string()
    .url("Must be a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
});

type InlineBrandInput = z.infer<typeof InlineBrandSchema>;

interface Brand {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InlineBrandFormProps {
  onCreated: (brand: Brand) => void;
  onCancel: () => void;
}

export function InlineBrandForm({ onCreated, onCancel }: InlineBrandFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InlineBrandInput>({
    resolver: zodResolver(InlineBrandSchema),
    defaultValues: { name: "", website: "" },
  });

  async function onSubmit(data: InlineBrandInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/v1/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          // Only send website if non-empty
          ...(data.website ? { website: data.website } : {}),
        }),
      });
      const json = (await res.json()) as {
        data: Brand;
        error: string | null;
      };
      if (!res.ok) {
        setServerError(json.error ?? "Failed to create brand");
        return;
      }
      onCreated(json.data);
    } catch {
      setServerError("Network error — please try again");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-medium">New brand</p>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="inline-brand-name">Brand name *</Label>
          <Input
            id="inline-brand-name"
            placeholder="e.g. Nike"
            {...register("name")}
            aria-invalid={errors.name ? "true" : undefined}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="inline-brand-website">Website (optional)</Label>
          <Input
            id="inline-brand-website"
            type="url"
            placeholder="https://nike.com"
            {...register("website")}
            aria-invalid={errors.website ? "true" : undefined}
          />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save brand"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
