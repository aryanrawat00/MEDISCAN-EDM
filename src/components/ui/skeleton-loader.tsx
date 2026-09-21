/**
 * src/components/ui/skeleton-loader.tsx
 * Reusable skeleton loading components for consistent loading states across the app.
 */

import React from "react";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <SkeletonLine className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLine className="h-20 w-full" />
      <div className="flex gap-2">
        <SkeletonLine className="h-8 w-24 rounded-md" />
        <SkeletonLine className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" aria-hidden="true">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex gap-4">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="h-4 w-16" />
        <SkeletonLine className="h-4 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/60 px-4 py-3 flex items-center gap-4">
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-4 w-12" />
          <SkeletonLine className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full-page loading state
 */
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline error display with retry
 */
export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
