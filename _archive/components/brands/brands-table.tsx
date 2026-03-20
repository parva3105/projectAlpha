"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type BrandRow = {
  id: string;
  name: string;
  website: string | null;
  openDealCount: number;
  totalDealValue: number;
};

type Props = {
  brands: BrandRow[];
};

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatWebsite(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function BrandsTable({ brands }: Props) {
  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No brands yet. Brands are created when you create a deal.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead>Website</TableHead>
          <TableHead className="text-right">Open deals</TableHead>
          <TableHead className="text-right">Total value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => (
          <TableRow key={brand.id}>
            <TableCell>
              <Link
                href={`/brands/${brand.id}`}
                className="font-medium hover:underline underline-offset-4"
              >
                {brand.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  {formatWebsite(brand.website)}
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {brand.openDealCount}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {brand.totalDealValue > 0
                ? formatDollars(brand.totalDealValue)
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
