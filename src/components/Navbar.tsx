import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Stethoscope,
  Settings,
  LogOut,
  FileText,
  Pill,
  History as HistoryIcon,
  LayoutDashboard,
  Info,
  Sparkles,
  Menu,
  X,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { mode, setPrefs } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMode = () => setPrefs({ mode: mode === "dark" ? "light" : "dark" });

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur shadow-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMobile} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            MediScan <span className="brand-text-gradient">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <NavLink to="/dashboard">
              <LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard
            </NavLink>
          )}
          <NavLink to="/analyzer">
            <FileText className="mr-1 h-4 w-4" /> Report Analyzer
          </NavLink>
          <NavLink to="/medicines">
            <Pill className="mr-1 h-4 w-4" /> Medicine Lens
          </NavLink>
          <NavLink to="/demo">
            <Sparkles className="mr-1 h-4 w-4 text-amber-500" /> Demo Lab
          </NavLink>
          {user && (
            <NavLink to="/history">
              <HistoryIcon className="mr-1 h-4 w-4" /> History
            </NavLink>
          )}
          <NavLink to="/about">
            <Info className="mr-1 h-4 w-4" /> About
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-xs font-semibold text-white">
                      {(user.email?.[0] ?? "U").toUpperCase()}
                    </div>
                    <span className="hidden text-sm sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate({ to: "/login" })} className="brand-gradient text-white">
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border/80 bg-background/95 backdrop-blur px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {user && (
              <MobileNavLink to="/dashboard" onClick={closeMobile}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </MobileNavLink>
            )}
            <MobileNavLink to="/analyzer" onClick={closeMobile}>
              <FileText className="mr-2 h-4 w-4" /> Report Analyzer
            </MobileNavLink>
            <MobileNavLink to="/medicines" onClick={closeMobile}>
              <Pill className="mr-2 h-4 w-4" /> Medicine Lens
            </MobileNavLink>
            <MobileNavLink to="/demo" onClick={closeMobile}>
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Demo Lab
            </MobileNavLink>
            {user && (
              <MobileNavLink to="/history" onClick={closeMobile}>
                <HistoryIcon className="mr-2 h-4 w-4" /> Saved History
              </MobileNavLink>
            )}
            <MobileNavLink to="/about" onClick={closeMobile}>
              <Info className="mr-2 h-4 w-4" /> About & Principles
            </MobileNavLink>

            <div className="pt-3 mt-2 border-t border-border/60">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs text-muted-foreground truncate">
                    Signed in as: <strong className="text-foreground">{user.email}</strong>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        closeMobile();
                        navigate({ to: "/profile" });
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        closeMobile();
                        await signOut();
                        navigate({ to: "/" });
                      }}
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    closeMobile();
                    navigate({ to: "/login" });
                  }}
                  className="w-full brand-gradient text-white"
                >
                  Sign in / Create Account
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{ className: "bg-accent text-foreground" }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{ className: "bg-accent text-foreground font-semibold" }}
    >
      {children}
    </Link>
  );
}

