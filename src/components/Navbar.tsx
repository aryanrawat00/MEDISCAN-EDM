import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Stethoscope, Settings, LogOut, FileText, Pill, History as HistoryIcon, LayoutDashboard, Info, Mail } from "lucide-react";
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

  const toggleMode = () => setPrefs({ mode: mode === "dark" ? "light" : "dark" });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            MediScan <span className="brand-text-gradient">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && <NavLink to="/dashboard"><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</NavLink>}
          <NavLink to="/analyzer"><FileText className="mr-1 h-4 w-4" /> Analyzer</NavLink>
          <NavLink to="/symptoms"><Stethoscope className="mr-1 h-4 w-4" /> Symptoms</NavLink>
          <NavLink to="/medicines"><Pill className="mr-1 h-4 w-4" /> Medicines</NavLink>
          {user && <NavLink to="/history"><HistoryIcon className="mr-1 h-4 w-4" /> History</NavLink>}
          <NavLink to="/about"><Info className="mr-1 h-4 w-4" /> About</NavLink>
          <NavLink to="/contact"><Mail className="mr-1 h-4 w-4" /> Contact</NavLink>
        </nav>


        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
                  Profile
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
      </div>
    </header>
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

