/**
 * Vitest tests for the landing page (app/page.tsx).
 *
 * The page is a Server Component that calls `auth()` from @clerk/nextjs/server.
 * We mock that import so the test runs in jsdom without a Clerk context.
 * The auth redirect logic is covered by e2e tests; here we test the static UI.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock Clerk server auth — return no session (unauthenticated visitor)
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ sessionClaims: null }),
}));

// Mock next/navigation redirect so the component doesn't throw
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
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

// ── Helpers ───────────────────────────────────────────────────────────────────

async function renderLandingPage() {
  // The page is an async Server Component — await it and render the result
  const { default: Home } = await import("./page");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsx = await (Home as any)();
  render(jsx);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Landing page — app/page.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the hero heading", async () => {
    await renderLandingPage();
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/deal pipeline for/i)).toBeInTheDocument();
  });

  it("primary CTA has href /signup", async () => {
    await renderLandingPage();
    const link = screen.getByRole("link", { name: /get started/i });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("secondary CTA has href /login", async () => {
    await renderLandingPage();
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("renders the Agency Account Manager role card", async () => {
    await renderLandingPage();
    expect(screen.getByText("Agency Account Manager")).toBeInTheDocument();
  });

  it("renders the Creator / Influencer role card", async () => {
    await renderLandingPage();
    expect(screen.getByText("Creator / Influencer")).toBeInTheDocument();
  });

  it("renders the Brand Manager role card", async () => {
    await renderLandingPage();
    expect(screen.getByText("Brand Manager")).toBeInTheDocument();
  });

  it("agency role card link points to /signup/agency", async () => {
    await renderLandingPage();
    const link = screen.getByRole("link", { name: /get started as an agency/i });
    expect(link).toHaveAttribute("href", "/signup/agency");
  });

  it("creator role card link points to /signup/creator", async () => {
    await renderLandingPage();
    const link = screen.getByRole("link", { name: /get started as a creator/i });
    expect(link).toHaveAttribute("href", "/signup/creator");
  });

  it("brand role card link points to /signup/brand", async () => {
    await renderLandingPage();
    const link = screen.getByRole("link", { name: /get started as a brand/i });
    expect(link).toHaveAttribute("href", "/signup/brand");
  });
});
