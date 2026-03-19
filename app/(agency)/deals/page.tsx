import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DealsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your brand deal pipeline.
          </p>
        </div>
        <Link href="/deals/new">
          <Button>New Deal</Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Kanban view available on the Dashboard. Deal list view coming in M2 polish.
      </p>
    </div>
  );
}
