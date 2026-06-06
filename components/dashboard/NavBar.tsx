"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { UserRole } from "@/types";

const navLinks: Record<UserRole, { label: string; href: string; icon: string }[]> = {
  farmer: [
    { label: "Dashboard", href: "/farmer/dashboard", icon: "🏠" },
    { label: "Marketplace", href: "/farmer/marketplace", icon: "📦" },
    { label: "Orders", href: "/farmer/orders", icon: "📋" },
    { label: "Financial", href: "/farmer/financial-tracker", icon: "💰" },
    { label: "Aid Programs", href: "/farmer/aid-programs", icon: "🤝" },
  ],
  buyer: [
    { label: "Browse", href: "/buyer/browse", icon: "🔍" },
    { label: "My Orders", href: "/buyer/orders", icon: "📋" },
  ],
  lgu: [
    { label: "Dashboard", href: "/lgu/dashboard", icon: "🏛️" },
    { label: "Aid Programs", href: "/lgu/aid-management", icon: "📋" },
    { label: "Farmers", href: "/lgu/farmers", icon: "👨‍🌾" },
  ],
  expert: [
    { label: "Forum", href: "/expert/forum", icon: "💡" },
    { label: "Community", href: "/community/forum", icon: "🌐" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "⚙️" },
    { label: "Users", href: "/admin/dashboard", icon: "👥" },
  ],
};

export default function NavBar() {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = profile?.role as UserRole;
  const links = navLinks[role] ?? [];

  const handleLogout = async () => {
    if (auth) await auth.signOut();
    router.push("/login");
  };

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-primary hidden sm:inline">FarmSystem</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
          <Link href="/market-prices" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/market-prices" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            <span>📈</span><span>Prices</span>
          </Link>
          <Link href="/community/forum" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/community") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            <span>🌐</span><span>Forum</span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Link href={`/${role}/dashboard`} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-card/95 backdrop-blur-sm px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <span>{l.icon}</span><span>{l.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
