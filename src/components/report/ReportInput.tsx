import { T, useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
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
        toast.error(t("Could not extract text from this PDF. Please ensure it has a text layer, or copy & paste."));
      } finally {
        setIsExtractingPdf(false);
      }
    } else if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      setFileName(file.name);
      setSourceKind("txt");
      toast.success(t("Loaded text file."));
    } else {
      toast.error(t("Please upload a .pdf or .txt report file."));
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
      toast.error(t("Please paste or upload a medical report."));
      return;
    }
    onAnalyze(text, fileName, sourceKind);
  };

  return (
    <div className={`space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label htmlFor="report-text" className="text-base font-semibold"> <T>{"Add your report"}</T> </Label>
          <p className="text-xs text-muted-foreground">
             <T>{"Upload a PDF or text file. You can also paste your report below."}</T> </p>
        </div>

        {/* Quick sample pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline"> <T>{"Try sample:"}</T> </span>
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

      <div className="flex flex-wrap gap-2 border-b border-border pb-4"><Button type="button" variant={inputMode === "upload" ? "secondary" : "ghost"} aria-pressed={inputMode === "upload"} onClick={() => setInputMode("upload")}> <T>{"Upload a file"}</T> </Button><Button type="button" variant={inputMode === "paste" ? "secondary" : "ghost"} aria-pressed={inputMode === "paste"} onClick={() => setInputMode("paste")}> <T>{"Paste report text"}</T> </Button></div>
      {inputMode === "upload" && <button type="button" disabled={isLoading || isExtractingPdf} onClick={() => fileInputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if (!isLoading && !isExtractingPdf && e.dataTransfer.files[0]) void handleFileUpload(e.dataTransfer.files[0]);}} className="flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/25 bg-primary/[.025] p-7 text-center transition-colors hover:border-primary/60 disabled:opacity-60"><span className="rounded-xl border border-border bg-card p-3"><Upload className="h-6 w-6 text-primary" /></span><span className="text-base font-semibold">{isExtractingPdf ? t("Reading your PDF…") : fileName || "Choose a report or drop it here"}</span><span className="text-xs text-muted-foreground"> <T>{"PDF with selectable text, or a TXT file"}</T> </span></button>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={inputMode === "paste" || text ? "relative" : "hidden"}>
          <Textarea
            id="report-text"
            aria-label={t("Report text")}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSourceKind("paste");
            }}
            placeholder={t("Paste complete blood count (CBC), metabolic panel, or lab report text here...")}
            className="min-h-[180px] text-sm leading-relaxed resize-y"
            disabled={isLoading || isExtractingPdf}
          />

          {isExtractingPdf && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span> <T>{"Reading your PDF…"}</T> </span>
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
               <T>{"Upload PDF or TXT"}</T> </Button>

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
                 <T>{"Clear"}</T> </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              {text.length}  <T>{"chars"}</T> </span>
            <Button
              type="submit"
              disabled={isLoading || isExtractingPdf || text.trim().length < 10}
              className="brand-gradient text-white shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   <T>{"Analyzing your report…"}</T> </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                   <T>{"Understand my report"}</T> </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/40">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
           <T>{"Values are compared with the reference ranges in your report. You can check the supporting evidence in your results."}</T> </span>
      </div>
    </div>
  );
}
