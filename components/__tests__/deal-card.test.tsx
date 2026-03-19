import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DealCard } from "../deals/DealCard";
import type { DealCardDeal } from "../deals/DealCard";

// next/link needs to be mocked in happy-dom environment
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const baseDeal: DealCardDeal = {
  id: "deal-1",
  title: "Nike Summer Campaign",
  brandName: "Nike",
  creatorName: "Jane Doe",
  deadline: "2026-06-01",
  dealValue: 500000, // $5,000 in cents
  stage: "IN_PRODUCTION",
  isOverdue: false,
};

describe("DealCard", () => {
  it("renders the deal title", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText("Nike Summer Campaign")).toBeInTheDocument();
  });

  it("renders the brand name", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText("Nike")).toBeInTheDocument();
  });

  it("renders the creator name when provided", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it('shows "Unassigned" when creatorName is null', () => {
    render(<DealCard deal={{ ...baseDeal, creatorName: null }} />);
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows Overdue badge when isOverdue is true", () => {
    render(<DealCard deal={{ ...baseDeal, isOverdue: true }} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("does not show Overdue badge when isOverdue is false", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
  });

  it("formats dealValue as currency (cents to dollars)", () => {
    render(<DealCard deal={baseDeal} />);
    // 500000 cents = $5,000
    expect(screen.getByText("$5,000")).toBeInTheDocument();
  });

  it("links to the deal detail page", () => {
    render(<DealCard deal={baseDeal} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/deals/deal-1");
  });

  it("does not render deadline when null", () => {
    render(<DealCard deal={{ ...baseDeal, deadline: null }} />);
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
  });
});
