"use client";

import { useState } from "react";
import { Button } from "@/components/ui/my_other_button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu } from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </DialogTrigger>
        <DialogContent /* side="left"  */ className="w-[240px] sm:w-[300px] pt-10">
          {children}
        </DialogContent>
      </Dialog>

      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex h-screen w-[240px] flex-col border-r bg-background p-4">
        {children}
      </div>
    </>
  );
}
