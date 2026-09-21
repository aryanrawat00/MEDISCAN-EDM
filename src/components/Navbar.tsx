import { languages, isLanguage, T, useI18n } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun, HeartPulse, Settings, LogOut, Menu, X, User, Globe, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const links = [{ to: "/", label: "Home" }, { to: "/analyzer", label: "Analyze Report" }, { to: "/medicines", label: "Medicine Lens" }, { to: "/medicines", hash: "drug-interaction-checker", label: "Interactions" }, { to: "/history", label: "History" }];
export function Navbar() {
  const { user, signOut } = useAuth();
  const { mode, setPrefs } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"><T>Skip to main content</T></a>
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/95 backdrop-blur-sm print:hidden" onKeyDown={e => { if (e.key === "Escape") close(); }}>
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" onClick={close} aria-label={t("MediScan")} className="flex shrink-0 items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><HeartPulse className="h-5 w-5" /></span><span className="text-xl font-bold tracking-tight">MediScan<span className="text-teal-600">.</span></span></Link>
        <nav aria-label={t("Main navigation")} className="hidden items-center gap-0.5 xl:flex">{links.map(link => <Link key={link.label} to={link.to} hash={link.hash} activeOptions={{ exact: true, includeHash: true }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "text-primary bg-accent" }}><T>{link.label}</T></Link>)}</nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <label className="flex min-w-0 items-center gap-1 rounded-lg border border-border bg-card px-2 sm:px-3"><Globe className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" /><span className="sr-only"><T>Language</T></span><select className="min-h-10 max-w-24 cursor-pointer bg-transparent py-2 text-xs sm:text-sm" value={language} onChange={e => { if (isLanguage(e.target.value)) setLanguage(e.target.value); }}>{languages.map(lang => <option key={lang.code} value={lang.code} className="bg-card text-foreground">{lang.name}</option>)}</select></label>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => setPrefs({ mode: mode === "dark" ? "light" : "dark" })} aria-label={t("Toggle theme")}>{mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
          {user ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label={t("My account")}><User className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel className="max-w-64 truncate">{user.email}</DropdownMenuLabel><DropdownMenuSeparator />{[{ to: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard }, { to: "/profile", label: t("Profile"), icon: User }, { to: "/settings", label: t("Settings"), icon: Settings }].map(({ to, label, icon: Icon }) => <DropdownMenuItem key={to} onClick={() => navigate({ to })}><Icon className="mr-2 h-4 w-4" /><T>{label}</T></DropdownMenuItem>)}<DropdownMenuSeparator /><DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" /><T>Sign out</T></DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <Button asChild variant="ghost" className="hidden xl:inline-flex"><Link to="/login"><T>Sign in</T></Link></Button>}
          <Button asChild className="hidden 2xl:inline-flex"><Link to="/analyzer"><T>Get started</T></Link></Button>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-label={t("Toggle navigation menu")} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" aria-label={t("Main navigation")} className="max-h-[calc(100dvh-5rem)] overflow-auto border-t border-border bg-card px-4 py-4 xl:hidden">{[...links, { to: "/demo", label: t("Guided demo") }, { to: "/about", label: t("About & FAQ") }].map(link => <Link key={link.label} to={link.to} hash={'hash' in link ? link.hash : undefined} onClick={close} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm hover:bg-muted"><T>{link.label}</T></Link>)}<div className="mt-3 flex gap-3 border-t border-border pt-4"><Button asChild className="flex-1" onClick={close}><Link to="/analyzer"><T>Continue as guest</T></Link></Button>{!user && <Button asChild variant="outline" onClick={close}><Link to="/login"><T>Sign in</T></Link></Button>}<Button variant="outline" size="icon" aria-label={t("Toggle theme")} onClick={() => setPrefs({ mode: mode === "dark" ? "light" : "dark" })}>{mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button></div></nav>}
    </header>
  </>;
}
