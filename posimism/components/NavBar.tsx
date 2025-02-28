"use client";

import * as React from "react";
import { UserIcon } from "lucide-react";
import { cn } from "@/utils/tailwind-utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Import UI components
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuLink 
} from "@/components/ui/navigation-menu";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
};

export type UserItem = {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
};

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  companyName?: string;
  navItems?: NavItem[];
  userItems?: UserItem[];
}

export function Navbar({
  companyName = "Company",
  navItems = [],
  userItems = [],
  className,
  ...props
}: NavbarProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        {/* Remove any width constraints and ensure full width */}
        <div className="flex h-14 items-center px-4 w-full max-w-none">
          {isMobile ? (
            // Mobile layout
            <>
              <SidebarTrigger />
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold">{companyName}</h1>
              </div>
              <UserDropdownMenu items={userItems} />
            </>
          ) : (
            // Desktop layout
            <>
              <div className="flex items-center">
                <h1 className="text-lg font-semibold">{companyName}</h1>
              </div>
              <Separator orientation="vertical" className="h-6 mx-4" />
              <div className="flex-1">
                <DesktopNav items={navItems} />
              </div>
              <UserDropdownMenu items={userItems} />
            </>
          )}
        </div>
      </header>
      
      {/* Mobile sidebar */}
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton 
                  asChild 
                  isActive={item.active}
                >
                  <a href={item.href}>
                    {item.icon}
                    {item.label}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

function DesktopNav({ items = [] }: { items: NavItem[] }) {
  return (
    <NavigationMenu className="justify-start">
      <NavigationMenuList className="flex items-center space-x-4">
        {items.map((item, i) => (
          <NavigationMenuItem key={i}>
            <NavigationMenuLink 
              href={item.href}
              data-active={item.active}
              className="flex items-center"
            >
              {item.icon}
              {item.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function UserDropdownMenu({ items = [] }: { items: UserItem[] }) {
  if (items.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground">
        <UserIcon className="h-5 w-5" />
        <span className="sr-only">User menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, i) => (
          <DropdownMenuItem 
            key={i} 
            onClick={item.onClick}
            variant={item.variant}
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}