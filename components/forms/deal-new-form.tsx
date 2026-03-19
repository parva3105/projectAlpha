"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InlineBrandForm } from "@/components/forms/inline-brand-form";

// ── Client-side form schema ────────────────────────────────────────────────────
// Dollar amounts as strings from the input — converted to numbers on submit
const DealFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brandId: z.string().min(1, "Brand is required"),
  creatorId: z.string().optional(),
  platform: z.enum([
    "Instagram",
    "TikTok",
    "YouTube",
    "Twitter",
    "LinkedIn",
    "Other",
  ]),
  dealValueDollars: z
    .number()
    .positive("Deal value must be positive"),
  commissionPct: z
    .number()
    .min(0, "Commission must be 0 or higher")
    .max(100, "Commission must be 100 or lower"),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormInput = z.infer<typeof DealFormSchema>;

interface Brand {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Creator {
  id: string;
  name: string;
  handle: string;
}

interface DealNewFormProps {
  brands: Brand[];
  creators: Creator[];
}

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "Other",
] as const;

function formatPayout(dollars: number, commissionPct: number): string {
  if (
    isNaN(dollars) ||
    isNaN(commissionPct) ||
    dollars < 0 ||
    commissionPct < 0 ||
    commissionPct > 100
  ) {
    return "$0.00";
  }
  const payout = dollars * (1 - commissionPct / 100);
  return `$${payout.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function DealNewForm({ brands: initialBrands, creators }: DealNewFormProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [showInlineBrand, setShowInlineBrand] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealFormInput>({
    resolver: zodResolver(DealFormSchema),
    defaultValues: {
      title: "",
      brandId: "",
      creatorId: "",
      platform: undefined,
      dealValueDollars: undefined,
      commissionPct: undefined,
      deadline: "",
      notes: "",
    },
  });

  // Watch for live payout preview — derived from inputs, no useEffect needed
  const watchedValue = watch("dealValueDollars");
  const watchedCommission = watch("commissionPct");
  const payoutPreview = formatPayout(
    Number(watchedValue) || 0,
    Number(watchedCommission) || 0
  );

  const watchedBrandId = watch("brandId");

  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__new__") {
      setShowInlineBrand(true);
      setValue("brandId", "");
    } else {
      setShowInlineBrand(false);
      setValue("brandId", val);
    }
  }

  function handleBrandCreated(brand: Brand) {
    setBrands((prev) => [...prev, brand]);
    setValue("brandId", brand.id);
    setShowInlineBrand(false);
  }

  async function onSubmit(data: DealFormInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/v1/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          brandId: data.brandId,
          creatorId: data.creatorId || undefined,
          // API expects dollars (not cents) — schema comment: "Deal face value in USD dollars"
          dealValue: data.dealValueDollars,
          commissionPct: data.commissionPct,
          deadline: data.deadline || undefined,
          notes: data.notes || undefined,
        }),
      });
      const json = (await res.json()) as {
        data: { id: string } | null;
        error: string | null;
      };
      if (!res.ok) {
        setServerError(json.error ?? "Failed to create deal");
        return;
      }
      if (json.data) {
        router.push(`/deals/${json.data.id}`);
      }
    } catch {
      setServerError("Network error — please try again");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="deal-title">Title *</Label>
        <Input
          id="deal-title"
          placeholder="e.g. Nike Summer Campaign"
          {...register("title")}
          aria-invalid={errors.title ? "true" : undefined}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-1">
        <Label htmlFor="deal-brand">Brand *</Label>
        <select
          id="deal-brand"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          value={showInlineBrand ? "__new__" : (watchedBrandId || "")}
          onChange={handleBrandChange}
          aria-invalid={errors.brandId ? "true" : undefined}
        >
          <option value="">Select a brand…</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
          <option value="__new__">+ Create new brand</option>
        </select>
        {errors.brandId && (
          <p className="text-xs text-destructive">{errors.brandId.message}</p>
        )}
      </div>

      {/* Inline brand creation */}
      {showInlineBrand && (
        <InlineBrandForm
          onCreated={handleBrandCreated}
          onCancel={() => {
            setShowInlineBrand(false);
            setValue("brandId", "");
          }}
        />
      )}

      {/* Creator (optional) */}
      <div className="space-y-1">
        <Label htmlFor="deal-creator">Creator (optional)</Label>
        <select
          id="deal-creator"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          {...register("creatorId")}
        >
          <option value="">None — assign later</option>
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (@{c.handle})
            </option>
          ))}
        </select>
      </div>

      {/* Platform */}
      <div className="space-y-1">
        <Label htmlFor="deal-platform">Platform *</Label>
        <Controller
          control={control}
          name="platform"
          render={({ field }) => (
            <select
              id="deal-platform"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value as DealFormInput["platform"] | ""
                )
              }
              aria-invalid={errors.platform ? "true" : undefined}
            >
              <option value="">Select a platform…</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        />
        {errors.platform && (
          <p className="text-xs text-destructive">{errors.platform.message}</p>
        )}
      </div>

      {/* Deal Value + Commission (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="deal-value">Deal Value ($) *</Label>
          <Input
            id="deal-value"
            type="number"
            min="0"
            step="0.01"
            placeholder="1500.00"
            {...register("dealValueDollars", { valueAsNumber: true })}
            aria-invalid={errors.dealValueDollars ? "true" : undefined}
          />
          {errors.dealValueDollars && (
            <p className="text-xs text-destructive">
              {errors.dealValueDollars.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="deal-commission">Commission % *</Label>
          <Input
            id="deal-commission"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="20"
            {...register("commissionPct", { valueAsNumber: true })}
            aria-invalid={errors.commissionPct ? "true" : undefined}
          />
          {errors.commissionPct && (
            <p className="text-xs text-destructive">
              {errors.commissionPct.message}
            </p>
          )}
        </div>
      </div>

      {/* Payout preview — derived from inputs, no useEffect */}
      {(watchedValue > 0 || watchedCommission >= 0) && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Creator receives: </span>
          <span className="font-semibold">{payoutPreview}</span>
        </div>
      )}

      {/* Deadline */}
      <div className="space-y-1">
        <Label htmlFor="deal-deadline">Deadline</Label>
        <Input
          id="deal-deadline"
          type="date"
          {...register("deadline")}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="deal-notes">Brief / Notes (optional)</Label>
        <Textarea
          id="deal-notes"
          rows={4}
          placeholder="Internal agency notes — not visible to creator or brand manager"
          {...register("notes")}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create Deal"}
      </Button>
    </form>
  );
}
