"use client";

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock next/navigation router (used in DealNewForm on submit)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock @clerk/nextjs (DealNewForm does not use it directly but imports may cascade)
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "test-user" }),
}));

// ── Payout preview calculation helper ─────────────────────────────────────────
// Extracted as a pure function so it can be unit-tested without a DOM.
function calcPayoutPreview(
  dealValueDollars: number,
  commissionPct: number
): string {
  if (
    isNaN(dealValueDollars) ||
    isNaN(commissionPct) ||
    dealValueDollars < 0 ||
    commissionPct < 0 ||
    commissionPct > 100
  ) {
    return "$0.00";
  }
  const payout = dealValueDollars * (1 - commissionPct / 100);
  return `$${payout.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// ── PayoutPreview unit tests ───────────────────────────────────────────────────
describe("calcPayoutPreview", () => {
  it("calculates payout correctly: $1000 value, 20% commission → $800.00", () => {
    expect(calcPayoutPreview(1000, 20)).toBe("$800.00");
  });

  it("calculates payout with 0% commission: $500 → $500.00", () => {
    expect(calcPayoutPreview(500, 0)).toBe("$500.00");
  });

  it("calculates payout with 100% commission → $0.00", () => {
    expect(calcPayoutPreview(1000, 100)).toBe("$0.00");
  });

  it("handles fractional values: $1500 at 15% → $1,275.00", () => {
    expect(calcPayoutPreview(1500, 15)).toBe("$1,275.00");
  });

  it("returns $0.00 for invalid (NaN) inputs", () => {
    expect(calcPayoutPreview(NaN, 20)).toBe("$0.00");
  });
});

// ── DealNewForm render tests ───────────────────────────────────────────────────
// We import lazily so the test file still compiles before the component exists.
// When the component doesn't exist yet this describe block will error at import,
// which is expected in TDD (red phase).
describe("DealNewForm", () => {
  it("renders all required fields", async () => {
    const { DealNewForm } = await import(
      "@/components/forms/deal-new-form"
    );
    render(
      <DealNewForm
        brands={[{ id: "b1", name: "Acme Corp", website: null, logoUrl: null, createdAt: new Date(), updatedAt: new Date() }]}
        creators={[]}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deal value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/commission/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
  });

  it("shows payout preview when deal value and commission are entered", async () => {
    const { DealNewForm } = await import(
      "@/components/forms/deal-new-form"
    );
    const user = userEvent.setup();
    render(
      <DealNewForm
        brands={[{ id: "b1", name: "Acme Corp", website: null, logoUrl: null, createdAt: new Date(), updatedAt: new Date() }]}
        creators={[]}
      />
    );

    const valueInput = screen.getByLabelText(/deal value/i);
    const commissionInput = screen.getByLabelText(/commission/i);

    await user.clear(valueInput);
    await user.type(valueInput, "1000");
    await user.clear(commissionInput);
    await user.type(commissionInput, "20");

    expect(screen.getByText(/creator receives/i)).toBeInTheDocument();
    expect(screen.getByText(/\$800\.00/)).toBeInTheDocument();
  });

  it("shows field-level error when title is missing on submit", async () => {
    const { DealNewForm } = await import(
      "@/components/forms/deal-new-form"
    );
    const user = userEvent.setup();
    render(
      <DealNewForm
        brands={[{ id: "b1", name: "Acme Corp", website: null, logoUrl: null, createdAt: new Date(), updatedAt: new Date() }]}
        creators={[]}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /create deal/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });
});

// ── DealDetail render tests ────────────────────────────────────────────────────
describe("DealDetail", () => {
  const mockDeal = {
    id: "deal1",
    title: "Nike Summer Campaign",
    stage: "IN_PRODUCTION" as const,
    dealValue: "2500.00",
    commissionPct: "20.00",
    creatorPayout: "2000.00",
    deadline: new Date("2026-07-01T00:00:00Z"),
    notes: "Internal agency notes",
    contractStatus: "SENT" as const,
    paymentStatus: "PENDING" as const,
    contractUrl: null,
    briefId: null,
    agencyClerkId: "agency1",
    brandId: "b1",
    creatorId: "c1",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: { id: "b1", name: "Nike", website: "https://nike.com", logoUrl: null, createdAt: new Date(), updatedAt: new Date() },
    creator: { id: "c1", name: "Jane Doe", handle: "janedoe", clerkId: "clerk1", bio: null, avatarUrl: null, platforms: ["instagram"], nicheTags: [], followerCount: 50000, engagementRate: null, isPublic: true, agencyClerkId: "agency1", createdAt: new Date(), updatedAt: new Date() },
    submissions: [],
  };

  it("renders Section A: Brief details", async () => {
    const { DealDetail } = await import(
      "@/components/deals/deal-detail"
    );
    render(<DealDetail deal={mockDeal} />);

    expect(screen.getByText("Nike Summer Campaign")).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    // Creator renders as "Jane Doe (@janedoe)"
    expect(screen.getByText(/Jane Doe \(@janedoe\)/)).toBeInTheDocument();
  });

  it("renders Section B: Contract with correct status badge", async () => {
    const { DealDetail } = await import(
      "@/components/deals/deal-detail"
    );
    render(<DealDetail deal={mockDeal} />);

    // "Section B — Contract" heading exists
    expect(screen.getByText(/Section B/i)).toBeInTheDocument();
    // The contract status badge shows "Sent"
    const badges = screen.getAllByText(/sent/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders Section D: Payment status", async () => {
    const { DealDetail } = await import(
      "@/components/deals/deal-detail"
    );
    render(<DealDetail deal={mockDeal} />);

    expect(screen.getByText(/Section D/i)).toBeInTheDocument();
    // Payment status badge shows "Pending"
    const pendingBadges = screen.getAllByText(/pending/i);
    expect(pendingBadges.length).toBeGreaterThan(0);
  });

  it("renders current stage badge prominently", async () => {
    const { DealDetail } = await import(
      "@/components/deals/deal-detail"
    );
    render(<DealDetail deal={mockDeal} />);

    expect(screen.getByTestId("current-stage-badge")).toBeInTheDocument();
    expect(screen.getByTestId("current-stage-badge").textContent).toMatch(/in production/i);
  });
});

// ── Stage control disabled buttons test ───────────────────────────────────────
describe("StageControlPanel", () => {
  it("renders PENDING_APPROVAL and LIVE as disabled with correct tooltip text", async () => {
    const { StageControlPanel } = await import(
      "@/components/deals/stage-control-panel"
    );
    render(
      <StageControlPanel
        dealId="deal1"
        currentStage="IN_PRODUCTION"
        onSuccess={vi.fn()}
      />
    );

    // The advance dropdown should show forward stages
    // PENDING_APPROVAL and LIVE should exist but be disabled options
    const pendingApprovalOption = screen.getByTestId("stage-option-PENDING_APPROVAL");
    const liveOption = screen.getByTestId("stage-option-LIVE");

    expect(pendingApprovalOption).toBeDisabled();
    expect(liveOption).toBeDisabled();
    expect(pendingApprovalOption).toHaveAttribute(
      "title",
      "Auto-set by system"
    );
    expect(liveOption).toHaveAttribute("title", "Auto-set by system");
  });

  it("hides Reopen button when stage is BRIEF_RECEIVED", async () => {
    const { StageControlPanel } = await import(
      "@/components/deals/stage-control-panel"
    );
    render(
      <StageControlPanel
        dealId="deal1"
        currentStage="BRIEF_RECEIVED"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /reopen/i })).not.toBeInTheDocument();
  });
});
