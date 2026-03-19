"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CreatorRow = {
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

type Props = {
  creators: CreatorRow[];
};

export function RosterTable({ creators }: Props) {
  if (creators.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Your roster is empty. Add creators manually here, or invite them to
          register on the platform (coming in M5).
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Handle</TableHead>
          <TableHead>Platform</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creators.map((creator) => (
          <TableRow key={creator.id}>
            <TableCell className="font-medium">{creator.name}</TableCell>
            <TableCell className="text-muted-foreground font-mono text-xs">
              @{creator.handle}
            </TableCell>
            <TableCell className="capitalize text-muted-foreground">
              {creator.platforms[0] ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
