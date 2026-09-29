"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/search-command";
import {
  Moon,
  Sun,
  Menu,
  X,
  PlayCircle,
  Flame,
  Sparkles,
  Compass,
  User,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogin = () => {
    signIn("AniListProvider");
  };

  const handleLogout = () => {
    signOut();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: PlayCircle },
    { href: "/trending", label: "Trending", icon: Flame },
    { href: "/popular", label: "Popular", icon: Sparkles },
    { href: "/search", label: "Browse", icon: Compass },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between gap-4">
        {/* Left: Brand + Desktop Navigation */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/" prefetch={true} className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md shadow-primary/25 border border-white/10 group-hover:scale-105 group-hover:border-primary/50 transition-all duration-300">
              <Image
                src="/logo.png"
                alt="Monu"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              Monu
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Theme Toggle, Auth */}
        <div className="flex items-center gap-2">
          <SearchCommand />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 rounded-lg border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/40 hover:ring-primary">
                  {(() => {
                    const avatarUrl =
                      typeof (session.user as any)?.image === "object"
                        ? (session.user as any)?.image?.medium || (session.user as any)?.image?.large
                        : (session.user?.image as string | undefined);

                    return avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={session.user?.name || "User avatar"}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    );
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-white/10">
                <Link href={`/profile/${session?.user?.name}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleLogin}
              className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 text-xs sm:text-sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="border-b border-white/10 bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden animate-in slide-in-from-top duration-200">
          <div className="grid gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}