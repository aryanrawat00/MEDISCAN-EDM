import { I18nProvider, T, useI18n } from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../lib/theme-context";
import { Navbar } from "../components/Navbar";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold brand-text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground"> <T>{"Page not found"}</T> </h2>
        <p className="mt-2 text-sm text-muted-foreground">
           <T>{"The page you're looking for doesn't exist or has been moved."}</T> </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md brand-gradient px-4 py-2 text-sm font-medium text-white"
          >
             <T>{"Go home"}</T> </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
           <T>{"This page didn't load"}</T> </h1>
        <p className="mt-2 text-sm text-muted-foreground">
           <T>{"Something went wrong on our end. You can try refreshing or head back home."}</T> </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md brand-gradient px-4 py-2 text-sm font-medium text-white"
          >
             <T>{"Try again"}</T> </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
             <T>{"Go home"}</T> </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "MediScan AI — Evidence-First Clinical Intelligence" },
      {
        name: "description",
        content:
          "MediScan AI is an evidence-first clinical intelligence platform for medical reports and medicines. Educational only — not a substitute for professional medical care.",
      },
      { name: "theme-color", content: "#2563eb" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "MediScan AI — Evidence-First Clinical Intelligence" },
      { property: "og:description", content: "Deterministic medical report analysis and medicine verification. Educational use only." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { t } = useI18n();
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider><ThemeProvider>
        <AuthProvider>
          <div className="medical-shell flex min-h-screen flex-col text-foreground">
            <Navbar />
            <main id="main-content" className="flex-1">
              <Outlet />
            </main>
            <footer className="border-t border-border bg-card py-10 text-sm print:hidden">
              <div className="home-container flex flex-col justify-between gap-7 sm:flex-row">
                <div><Link to="/" className="text-lg font-bold tracking-tight">MediScan<span className="text-teal-600">.</span></Link><p className="mt-2 text-xs text-muted-foreground"><T>A little clarity for your health journey.</T></p></div>
                <nav aria-label={t("Footer")} className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
                  {[{to:"/analyzer",label:t("Analyze Report")},{to:"/medicines",label:t("Medicine Lens")},{to:"/medicines",hash:"drug-interaction-checker",label:t("Interactions")},{to:"/history",label:t("History")},{to:"/about",label:t("About")},{to:"/about",hash:"faq",label:t("FAQ")},{to:"/about",hash:"privacy",label:t("Privacy")},{to:"/about",hash:"disclaimer",label:t("Disclaimer")},{to:"/demo",label:t("Guided demo")}].map(item=><Link key={item.label} to={item.to} hash={item.hash} className="hover:text-foreground"><T>{item.label}</T></Link>)}
                </nav>
              </div>
              <p className="home-container mt-8 border-t border-border pt-5 text-xs text-muted-foreground">© {new Date().getFullYear()} MediScan · <T>Educational use only. Not medical advice.</T></p>
            </footer>

          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider></I18nProvider>
    </QueryClientProvider>
  );
}
