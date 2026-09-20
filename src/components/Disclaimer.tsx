import { AlertTriangle } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300 ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>Educational use only.</strong> MediScan AI does not diagnose conditions. Always
        consult a qualified healthcare professional for medical advice.
      </p>
    </div>
  );
}
