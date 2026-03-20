"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddCreatorForm } from "@/components/roster/add-creator-form";
import { PlusIcon } from "lucide-react";

export function AddCreatorSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm">
            <PlusIcon />
            Add Creator
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add Creator</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <AddCreatorForm onSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
