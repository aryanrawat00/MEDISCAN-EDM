import { ShieldCheck } from "lucide-react";
import { T } from "@/lib/i18n";
export function Disclaimer({ className = "" }: { className?: string }) {
 return <div className={`flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground ${className}`}><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" /><p><T>MediScan is an educational and decision-support tool. It does not diagnose conditions, prescribe treatment, or replace professional medical advice.</T></p></div>;
}
