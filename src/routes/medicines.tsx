/**
 * src/routes/medicines.tsx
 * M06: Medicine Lens Route (Blueprint §10).
 * Multi-modal medicine packaging scanner and approved openFDA monograph lookup.
 * "Evidence first. AI second. Code decides."
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicineIdentityCard } from "@/components/medicine/MedicineIdentityCard";
import { IngredientsTable } from "@/components/medicine/IngredientsTable";
import { MonographView } from "@/components/medicine/MonographView";
import { PackagingEvidenceViewer } from "@/components/medicine/PackagingEvidenceViewer";
import { useMedicineScan } from "@/hooks/useMedicineScan";
import { MEDICINE_SAMPLES, MedicineSample } from "@/lib/medicine/samples";
import { searchReferenceMonographs } from "@/lib/medicine/reference";
import { saveAnalysis } from "@/lib/analyses";
import {
  Pill,
  Camera,
  Upload,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  Bookmark,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/medicines")({
  head: () => ({ meta: [{ title: "Medicine Lens — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <MedicineLens />
    </AuthGate>
  ),
});

type MedicineTab = "ingredients" | "monograph" | "evidence";

function MedicineLens() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<MedicineTab>("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    status,
    scan,
    imagePreview,
    error,
    scanFile,
    loadScan,
    reset,
  } = useMedicineScan();

  const isScanning = status === "PROCESSING_IMAGE" || status === "SCANNING";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    const out = await scanFile(file);
    if (out) {
      const title =
        out.brandName ||
        (out.monographs[0]?.displayName ?? `Medicine Scan · ${new Date().toLocaleDateString()}`);

      saveAnalysis({
        kind: "medicine",
        title,
        input: out.transcribedText || file.name,
        result: out,
      })
        .then(() => {
          qc.invalidateQueries({ queryKey: ["analyses"] });
        })
        .catch((err) => {
          console.warn("Failed to auto-save medicine scan:", err);
        });
    }
  };

  const handleSelectSample = (s: MedicineSample) => {
    loadScan(s.precomputedScan);
    toast.success(`Loaded sample: ${s.title}`);
  };

  const handleReset = () => {
    reset();
    setActiveTab("ingredients");
    setSearchQuery("");
  };

  // Monograph quick search results
  const searchResults = searchQuery.trim().length >= 2
    ? searchReferenceMonographs(searchQuery)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Medicine Lens</h1>
            <p className="text-sm text-muted-foreground">
              Verify packaging labels, active ingredients, and official openFDA drug monographs.
            </p>
          </div>
        </div>

        {scan && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Scan
          </Button>
        )}
      </div>

      <Disclaimer className="mt-4" />

      {/* Main Content Area */}
      {!scan ? (
        <div className="mt-8 space-y-8">
          {/* Top Row: Scanner and Quick Lookup */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Box 1: Package Photo Uploader */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Package Lens Scan</h2>
                  <p className="text-xs text-muted-foreground">
                    Photograph a medicine box, strip, or bottle label.
                  </p>
                </div>
              </div>

              <div
                onClick={() => !isScanning && fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30"
              >
                {isScanning ? (
                  <div className="space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-medium">
                      {status === "PROCESSING_IMAGE" ? "Preparing image…" : "Reading packaging label…"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Extracting text and verifying active ingredients…
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground/80 mb-2" />
                    <p className="text-sm font-medium">Click to upload packaging photo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP up to 5 MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isScanning}
                />
              </div>
            </div>

            {/* Box 2: Reference Monograph Search */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Official Monograph Lookup</h2>
                  <p className="text-xs text-muted-foreground">
                    Search human-reviewed openFDA OTC drug labels.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Paracetamol, Advil, Cetirizine, Omeprazole…"
                  className="pl-9 text-sm"
                />
              </div>

              {/* Live search results */}
              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-auto rounded-lg border border-border bg-card divide-y divide-border">
                  {searchResults.map((m) => (
                    <div
                      key={m.key}
                      onClick={() => {
                        const sampleMatch = MEDICINE_SAMPLES.find((s) =>
                          s.title.toLowerCase().includes(m.key),
                        );
                        if (sampleMatch) {
                          loadScan(sampleMatch.precomputedScan);
                        } else {
                          toast.info(`Loaded reference for ${m.displayName}`);
                        }
                      }}
                      className="p-3 hover:bg-muted/40 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{m.displayName}</span>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 line-clamp-1">{m.purposeText}</p>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No matching OTC monographs found for "{searchQuery}".
                </p>
              )}
            </div>
          </div>

          {/* Quick Pre-Verified Samples Strip */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Try Pre-Verified Sample Medicines
              </h3>
              <p className="text-xs text-muted-foreground">
                Load instant packaging scans with 100% verified openFDA reference monographs.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {MEDICINE_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase">
                      {s.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-sm text-foreground">{s.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="mt-6 space-y-6">
          <MedicineIdentityCard scan={scan} />

          {/* Sub Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("ingredients")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                activeTab === "ingredients"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Verified Ingredients ({scan.verifiedIngredients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monograph")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                activeTab === "monograph"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" /> Reference Monograph ({scan.monographs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                activeTab === "evidence"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Packaging OCR Evidence
            </button>
          </div>

          {/* Tab 1: Ingredients */}
          {activeTab === "ingredients" && (
            <div className="space-y-6">
              <IngredientsTable ingredients={scan.verifiedIngredients} />

              {/* Safety Warnings Banner */}
              {scan.safetyWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    Important Safety Warnings from Official FDA Label
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    {scan.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Monograph */}
          {activeTab === "monograph" && (
            <MonographView monographs={scan.monographs} />
          )}

          {/* Tab 3: Packaging OCR Evidence */}
          {activeTab === "evidence" && (
            <PackagingEvidenceViewer
              transcribedText={scan.transcribedText}
              evidenceItems={scan.packagingEvidence}
              imagePreview={imagePreview}
            />
          )}
        </div>
      )}
    </div>
  );
}
