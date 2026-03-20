/**
 * Vitest tests for SignupRolePicker component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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

// Mock shadcn/ui Card components (they don't rely on browser APIs)
// — no mock needed; they render as plain divs in jsdom

import SignupRolePicker from "@/components/auth/signup-role-picker";

describe("SignupRolePicker", () => {
  it("renders the heading", () => {
    render(<SignupRolePicker />);
    expect(
      screen.getByText("How will you use Brand Deal Manager?")
    ).toBeInTheDocument();
  });

  it("renders the Agency Account Manager card", () => {
    render(<SignupRolePicker />);
    expect(screen.getByText("Agency Account Manager")).toBeInTheDocument();
  });

  it("renders the Creator / Influencer card", () => {
    render(<SignupRolePicker />);
    expect(screen.getByText("Creator / Influencer")).toBeInTheDocument();
  });

  it("renders the Brand Manager card", () => {
    render(<SignupRolePicker />);
    expect(screen.getByText("Brand Manager")).toBeInTheDocument();
  });

  it("agency card link has href /signup/agency", () => {
    render(<SignupRolePicker />);
    const link = screen.getByRole("link", { name: /get started as an agency/i });
    expect(link).toHaveAttribute("href", "/signup/agency");
  });

  it("creator card link has href /signup/creator", () => {
    render(<SignupRolePicker />);
    const link = screen.getByRole("link", { name: /get started as a creator/i });
    expect(link).toHaveAttribute("href", "/signup/creator");
  });

  it("brand card link has href /signup/brand", () => {
    render(<SignupRolePicker />);
    const link = screen.getByRole("link", { name: /get started as a brand/i });
    expect(link).toHaveAttribute("href", "/signup/brand");
  });

  it("sign-in link has href /login", () => {
    render(<SignupRolePicker />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
