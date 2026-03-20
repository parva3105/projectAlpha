"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "linkedin",
  "facebook",
  "snapchat",
  "pinterest",
  "other",
] as const;

type Platform = (typeof PLATFORMS)[number];

type FormState = {
  name: string;
  handle: string;
  platform: Platform | "";
  email: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validateForm(values: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  }
  if (!values.handle.trim()) {
    errors.handle = "Handle is required";
  } else if (!/^[a-z0-9_-]+$/.test(values.handle.trim())) {
    errors.handle =
      "Handle must be lowercase alphanumeric, _ or -";
  }
  if (!values.platform) {
    errors.platform = "Platform is required";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Must be a valid email";
  }

  return errors;
}

type Props = {
  onSuccess: () => void;
};

export function AddCreatorForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    handle: "",
    platform: "",
    email: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handlePlatformChange(value: string | null) {
    setForm((prev) => ({ ...prev, platform: (value ?? "") as Platform }));
    if (errors.platform) {
      setErrors((prev) => ({ ...prev, platform: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const body: {
        name: string;
        handle: string;
        platform: string;
        email?: string;
      } = {
        name: form.name.trim(),
        handle: form.handle.trim(),
        platform: form.platform as string,
      };
      if (form.email.trim()) {
        body.email = form.email.trim();
      }

      const res = await fetch("/api/v1/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as { data: unknown; error: string | null };

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong.");
        return;
      }

      setForm({ name: "", handle: "", platform: "", email: "" });
      setErrors({});
      onSuccess();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="creator-name">Name</Label>
        <Input
          id="creator-name"
          name="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          autoComplete="off"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Handle */}
      <div className="space-y-1.5">
        <Label htmlFor="creator-handle">Handle</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            @
          </span>
          <Input
            id="creator-handle"
            name="handle"
            placeholder="janedoe"
            value={form.handle}
            onChange={handleChange}
            aria-invalid={!!errors.handle}
            autoComplete="off"
            className="pl-6"
          />
        </div>
        {errors.handle && (
          <p className="text-xs text-destructive">{errors.handle}</p>
        )}
      </div>

      {/* Platform */}
      <div className="space-y-1.5">
        <Label htmlFor="creator-platform">Platform</Label>
        <Select
          value={form.platform}
          onValueChange={handlePlatformChange}
        >
          <SelectTrigger
            id="creator-platform"
            aria-invalid={!!errors.platform}
            className="w-full"
          >
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.platform && (
          <p className="text-xs text-destructive">{errors.platform}</p>
        )}
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="creator-email">
          Email{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="creator-email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          autoComplete="off"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      {serverError && (
        <p className="text-xs text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Adding..." : "Add Creator"}
      </Button>
    </form>
  );
}
