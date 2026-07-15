"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  ListChecks,
  CheckSquare,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/deals", label: "Deals", icon: DollarSign },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

export function Navbar({ profile, email }: { profile: Profile | null; email: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = profile?.full_name || email;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              E
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">EnhanceMove</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Profile &amp; settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="grid grid-cols-3 gap-1 border-t border-border p-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium",
                  active ? "bg-primary-50 text-primary-700" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
