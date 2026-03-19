'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

export function KanbanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const platform = searchParams.get("platform") ?? "all";
  const creator = searchParams.get("creator") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const overdueOnly = searchParams.get("overdueOnly") === "true";

  const updateParams = useCallback(
    (updates: Record<string, string | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === false || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Platform */}
      <Select
        value={platform}
        onValueChange={(val: string | null) =>
          updateParams({ platform: val ?? "all" })
        }
      >
        <SelectTrigger className="h-8 w-44 text-xs">
          <SelectValue placeholder="All Platforms" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value} className="text-xs">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Creator */}
      <Input
        type="text"
        placeholder="Filter by creator..."
        defaultValue={creator}
        className="h-8 w-44 text-xs"
        onChange={(e) => updateParams({ creator: e.target.value })}
      />

      {/* Brand */}
      <Input
        type="text"
        placeholder="Filter by brand..."
        defaultValue={brand}
        className="h-8 w-44 text-xs"
        onChange={(e) => updateParams({ brand: e.target.value })}
      />

      {/* Overdue only */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          checked={overdueOnly}
          onCheckedChange={(checked: boolean) =>
            updateParams({ overdueOnly: checked })
          }
        />
        <span className="text-xs text-foreground">Overdue only</span>
      </label>
    </div>
  );
}
