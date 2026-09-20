/**
 * src/components/report/ReportInput.tsx
 * T15: Multi-modal report input component (Blueprint §5, §15, §18).
 * Supports direct text pasting, .txt uploads, client-side PDF extraction,
 * and instant loading of pre-verified synthetic demo samples.
 */

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Sparkles, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { extractTextFromPdf } from "@/lib/report/pdf";
import { REPORT_SAMPLES, ReportSample } from "@/lib/report/samples";
import { toast } from "sonner";

interface ReportInputProps {
  isLoading: boolean;
  onAnalyze: (text: string, fileName?: string, sourceKind?: "paste" | "txt" | "pdf" | "demo") => void;
  className?: string;
}

export function ReportInput({ isLoading, onAnalyze, className = "" }: ReportInputProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();
  const [sourceKind, setSourceKind] = useState<"paste" | "txt" | "pdf" | "demo">("paste");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setIsExtractingPdf(true);
      try {
        const res = await extractTextFromPdf(file);
        setText(res.text);
        setFileName(file.name);
        setSourceKind("pdf");
        toast.success(`Extracted ${res.pages} page(s) from PDF.`);
      } catch (err: any) {
        console.error("PDF Extraction error:", err);
        toast.error("Could not extract text from this PDF. Please ensure it has a text layer, or copy & paste.");
      } finally {
        setIsExtractingPdf(false);
      }
    } else if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      setFileName(file.name);
      setSourceKind("txt");
      toast.success("Loaded text file.");
    } else {
      toast.error("Please upload a .pdf or .txt report file.");
    }
  };

  const handleSampleSelect = (sample: ReportSample) => {
    setText(sample.sourceText);
    setFileName(`${sample.title}.txt`);
    setSourceKind("demo");
    toast.success(`Loaded sample: ${sample.title}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please paste or upload a medical report.");
      return;
    }
    onAnalyze(text, fileName, sourceKind);
  };

  return (
    <div className={`space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label className="text-base font-semibold">Report Input</Label>
          <p className="text-xs text-muted-foreground">
            Paste text, drop a lab PDF, or choose a synthetic clinical sample.
          </p>
        </div>

        {/* Quick sample pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Try sample:</span>
          {REPORT_SAMPLES.map((sample) => (
            <Button
              key={sample.id}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleSampleSelect(sample)}
            >
              <Sparkles className="mr-1 h-3 w-3 text-primary" />
              {sample.title.split(" ")[0]}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSourceKind("paste");
            }}
            placeholder="Paste complete blood count (CBC), metabolic panel, or lab report text here..."
            className="min-h-[220px] font-mono text-xs leading-relaxed resize-y"
            disabled={isLoading || isExtractingPdf}
          />

          {isExtractingPdf && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recovering PDF text layout in browser...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isExtractingPdf}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Upload PDF or TXT
            </Button>

            {text && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setText("");
                  setFileName(undefined);
                  setSourceKind("paste");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              {text.length} chars
            </span>
            <Button
              type="submit"
              disabled={isLoading || isExtractingPdf || text.trim().length < 10}
              className="brand-gradient text-white shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Evidence...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze with Evidence
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/40">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Evidence Guarantee:</strong> Every result is anchored to a verbatim quote in your submitted text. Values are evaluated strictly against the report's printed reference range.
        </span>
      </div>
    </div>
  );
}
