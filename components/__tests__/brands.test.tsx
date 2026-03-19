/**
 * TDD tests for brands and roster components.
 * Written before implementation per project standards.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation before importing components
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock next/link to a simple anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { BrandsTable } from "@/components/brands/brands-table";
import { RosterTable } from "@/components/roster/roster-table";
import { AddCreatorForm } from "@/components/roster/add-creator-form";

// ─── Type helpers matching API response shapes ────────────────────────────────

type BrandRow = {
  id: string;
  name: string;
  website: string | null;
  openDealCount: number;
  totalDealValue: number;
};

type CreatorRow = {
  id: string;
  name: string;
  handle: string;
  platforms: string[];
  bio: string | null;
  isPublic: boolean;
  clerkId: string;
  agencyClerkId: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── BrandsTable tests ────────────────────────────────────────────────────────

describe("BrandsTable", () => {
  const brands: BrandRow[] = [
    {
      id: "brand-1",
      name: "Acme Corp",
      website: "https://acme.com",
      openDealCount: 3,
      totalDealValue: 150000,
    },
    {
      id: "brand-2",
      name: "GlobalTech",
      website: null,
      openDealCount: 0,
      totalDealValue: 0,
    },
  ];

  it("renders a row for each brand", () => {
    render(<BrandsTable brands={brands} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("GlobalTech")).toBeInTheDocument();
  });

  it("renders brand website when present", () => {
    render(<BrandsTable brands={brands} />);
    expect(screen.getByText("acme.com")).toBeInTheDocument();
  });

  it("shows dash for missing website", () => {
    render(<BrandsTable brands={brands} />);
    const dashCells = screen.getAllByText("—");
    expect(dashCells.length).toBeGreaterThan(0);
  });

  it("renders open deal count", () => {
    render(<BrandsTable brands={brands} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("links each row to /brands/:id", () => {
    render(<BrandsTable brands={brands} />);
    const link = screen.getByRole("link", { name: "Acme Corp" });
    expect(link).toHaveAttribute("href", "/brands/brand-1");
  });

  it("shows empty state when no brands provided", () => {
    render(<BrandsTable brands={[]} />);
    expect(
      screen.getByText(/no brands yet/i)
    ).toBeInTheDocument();
  });
});

// ─── RosterTable tests ────────────────────────────────────────────────────────

describe("RosterTable", () => {
  const creators: CreatorRow[] = [
    {
      id: "creator-1",
      name: "Jane Doe",
      handle: "janedoe",
      platforms: ["instagram", "tiktok"],
      bio: null,
      isPublic: true,
      clerkId: "clerk_jane",
      agencyClerkId: "agency_1",
      createdAt: "2026-03-19T00:00:00.000Z",
      updatedAt: "2026-03-19T00:00:00.000Z",
    },
  ];

  it("renders creator rows", () => {
    render(<RosterTable creators={creators} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders the handle with @ prefix", () => {
    render(<RosterTable creators={creators} />);
    expect(screen.getByText("@janedoe")).toBeInTheDocument();
  });

  it("renders primary platform", () => {
    render(<RosterTable creators={creators} />);
    expect(screen.getByText("instagram")).toBeInTheDocument();
  });

  it("shows empty state when roster is empty", () => {
    render(<RosterTable creators={[]} />);
    expect(screen.getByText(/your roster is empty/i)).toBeInTheDocument();
  });
});

// ─── AddCreatorForm validation tests ─────────────────────────────────────────

describe("AddCreatorForm", () => {
  it("shows validation error when name is empty on submit", async () => {
    render(<AddCreatorForm onSuccess={vi.fn()} />);
    const submitBtn = screen.getByRole("button", { name: /add creator/i });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it("shows validation error when handle is empty on submit", async () => {
    render(<AddCreatorForm onSuccess={vi.fn()} />);
    // Fill name but leave handle empty
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.click(screen.getByRole("button", { name: /add creator/i }));
    expect(await screen.findByText(/handle is required/i)).toBeInTheDocument();
  });

  it("email field is optional — does not show error when empty", async () => {
    render(<AddCreatorForm onSuccess={vi.fn()} />);
    const nameInput = screen.getByLabelText(/name/i);
    const handleInput = screen.getByLabelText(/handle/i);
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(handleInput, { target: { value: "janedoe" } });
    fireEvent.click(screen.getByRole("button", { name: /add creator/i }));
    // email error should NOT appear
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it("shows error for invalid handle characters", async () => {
    render(<AddCreatorForm onSuccess={vi.fn()} />);
    const handleInput = screen.getByLabelText(/handle/i);
    fireEvent.change(handleInput, { target: { value: "Jane Doe!" } });
    fireEvent.click(screen.getByRole("button", { name: /add creator/i }));
    expect(
      await screen.findByText(/handle must be lowercase alphanumeric/i)
    ).toBeInTheDocument();
  });
});
