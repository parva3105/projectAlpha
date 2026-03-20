/**
 * Vitest tests for AuthLayout component.
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

import AuthLayout from "@/components/auth/auth-layout";

describe("AuthLayout", () => {
  const defaultProps = {
    tagline: "Welcome back.",
    benefits: ["Benefit one", "Benefit two"],
    bottomLink: { label: "No account?", text: "Sign up", href: "/signup" },
    children: <div data-testid="clerk-widget">Clerk widget</div>,
  };

  it("renders the tagline in the left panel", () => {
    render(<AuthLayout {...defaultProps} />);
    expect(screen.getByText("Welcome back.")).toBeInTheDocument();
  });

  it("renders the benefits list", () => {
    render(<AuthLayout {...defaultProps} />);
    expect(screen.getByText("Benefit one")).toBeInTheDocument();
    expect(screen.getByText("Benefit two")).toBeInTheDocument();
  });

  it("renders children (Clerk widget slot)", () => {
    render(<AuthLayout {...defaultProps} />);
    expect(screen.getByTestId("clerk-widget")).toBeInTheDocument();
  });

  it("renders the bottomLink with correct href", () => {
    render(<AuthLayout {...defaultProps} />);
    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("renders the bottomLink label text", () => {
    render(<AuthLayout {...defaultProps} />);
    expect(screen.getByText("No account?")).toBeInTheDocument();
  });

  it("left panel has md:flex in its className (hidden on mobile)", () => {
    const { container } = render(<AuthLayout {...defaultProps} />);
    // The left panel div contains both the tagline and "hidden md:flex" class
    const leftPanel = container.querySelector(".md\\:flex");
    expect(leftPanel).not.toBeNull();
    // It should also have "hidden" to be hidden on mobile
    expect(leftPanel?.className).toMatch(/hidden/);
  });

  it("renders without benefits when omitted", () => {
    const { queryByRole } = render(
      <AuthLayout
        tagline="Test tagline"
        bottomLink={{ label: "label", text: "link text", href: "/test" }}
      >
        <div>child</div>
      </AuthLayout>
    );
    // No list items should be present
    const listItems = queryByRole("listitem");
    expect(listItems).toBeNull();
  });
});
