/**
 * src/routes/medicines.tsx
 * M06: Medicine Lens Route (Blueprint §10).
 * Multi-modal medicine packaging scanner and approved openFDA monograph lookup.
 * "Evidence first. AI second. Code decides."
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
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
import { MedicineReferenceEntry } from "@/lib/medicine/reference.data";
import { saveAnalysis } from "@/lib/analyses";
import { DrugInteractionChecker } from "@/components/medicine/DrugInteractionChecker";
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
  LogIn,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/medicines")({
  head: () => ({ meta: [{ title: "Medicine Lens — MediScan AI" }] }),
  component: () => <MedicineLens />,
});

type MedicineTab = "ingredients" | "monograph" | "evidence" | "interactions";

function MedicineLens() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<MedicineTab>("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonograph, setSelectedMonograph] = useState<MedicineReferenceEntry | null>(null);
  const [interactionMeds, setInteractionMeds] = useState<string[]>([]);
  const [interactionCount, setInteractionCount] = useState<number>(0);

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

    setSelectedMonograph(null);
    const out = await scanFile(file);
    if (out) {
      const title =
        out.brandName ||
        (out.monographs[0]?.displayName ?? `Medicine Scan · ${new Date().toLocaleDateString()}`);

      if (user) {
        saveAnalysis({
          kind: "medicine",
          title,
          input: out.transcribedText || file.name,
          result: out,
        })
          .then(() => {
            qc.invalidateQueries({ queryKey: ["analyses"] });
            toast.success("Medicine scan saved to your private history.");
          })
          .catch((err) => {
            console.warn("Failed to auto-save medicine scan:", err);
          });
      } else {
        toast.info("Scan completed in Guest Mode. Sign in anytime to save your results to permanent history.");
      }
    }
  };

  const handleSelectSample = (s: MedicineSample) => {
    setSelectedMonograph(null);
    loadScan(s.precomputedScan);
    toast.success(`Loaded sample: ${s.title}`);
  };

  const handleReset = () => {
    reset();
    setSelectedMonograph(null);
    setActiveTab("ingredients");
    setSearchQuery("");
  };

  const handleAddToChecker = (medName: string) => {
    const trimmed = medName.trim();
    if (!trimmed) return;
    setInteractionMeds((prev) => {
      const lower = trimmed.toLowerCase();
      if (prev.some((m) => m.toLowerCase() === lower)) {
        toast.info(`"${trimmed}" is already in your interaction list.`);
        return prev;
      }
      toast.success(`Added "${trimmed}" to Interaction Check.`);
      return [...prev, trimmed];
    });

    if (scan) {
      setActiveTab("interactions");
    } else {
      setTimeout(() => {
        const el = document.getElementById("drug-interaction-checker");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  // Monograph quick search results
  const searchResults = searchQuery.trim().length >= 2
    ? searchReferenceMonographs(searchQuery)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Guest Mode Banner */}
      {!user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-xs text-foreground print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Guest Session
            </span>
            <span className="text-muted-foreground">
              Live medicine packaging vision and openFDA monograph lookup active. Results remain in session memory.
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
            <Link to="/login">
              <LogIn className="mr-1.5 h-3 w-3" /> Sign in to save history
            </Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
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

        {(scan || selectedMonograph) && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Lookup / Scan
          </Button>
        )}
      </div>

      <Disclaimer className="mt-4 print:hidden" />

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
                      className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors text-xs"
                    >
                      <div
                        onClick={() => {
                          setSelectedMonograph(m);
                          toast.success(`Loaded FDA monograph: ${m.displayName}`);
                        }}
                        className="flex-1 cursor-pointer pr-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{m.displayName}</span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                            {m.category}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1">{m.purposeText}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToChecker(m.displayName)}
                        className="h-7 px-2 text-[11px] text-primary border-primary/30 hover:bg-primary/5 shrink-0"
                        title="Add to interaction check"
                      >
                        <ArrowRightLeft className="h-3 w-3 mr-1" /> + Check
                      </Button>
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

          {/* Active Monograph Inspector (from direct reference browsing) */}
          {selectedMonograph && (
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      Approved openFDA Monograph: {selectedMonograph.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Official OTC monograph snapshot · Zero AI hallucination
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToChecker(selectedMonograph.displayName)}
                    className="h-8 px-2.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                  >
                    <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" /> Add to Interaction Check
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMonograph(null)}
                    className="h-8 px-2 text-xs"
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Close View
                  </Button>
                </div>
              </div>

              <MonographView
                monographs={[selectedMonograph]}
                onAddToChecker={(mono) => handleAddToChecker(mono.displayName)}
              />
            </div>
          )}

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

          {/* Integrated Drug Interaction Checker (Deterministic, Ground-Truth Monograph Lookup) */}
          <DrugInteractionChecker
            initialMedicines={interactionMeds}
            onMedicinesCountChange={setInteractionCount}
          />
        </div>
      ) : (
        /* Results View */
        <div className="mt-6 space-y-6">
          <MedicineIdentityCard
            scan={scan}
            onAddToChecker={() =>
              handleAddToChecker(
                scan.brandName || scan.verifiedIngredients[0]?.name || "Scanned Medicine",
              )
            }
          />

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
            <button
              type="button"
              onClick={() => setActiveTab("interactions")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                activeTab === "interactions"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" /> Drug Interaction Check
              {interactionCount > 0 ? ` (${interactionCount})` : ""}
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
            <MonographView
              monographs={scan.monographs}
              onAddToChecker={(mono) => handleAddToChecker(mono.displayName)}
            />
          )}

          {/* Tab 3: Packaging OCR Evidence */}
          {activeTab === "evidence" && (
            <PackagingEvidenceViewer
              transcribedText={scan.transcribedText}
              evidenceItems={scan.packagingEvidence}
              imagePreview={imagePreview}
            />
          )}

          {/* Tab 4: Drug Interaction Check */}
          {activeTab === "interactions" && (
            <DrugInteractionChecker
              initialMedicines={interactionMeds}
              onMedicinesCountChange={setInteractionCount}
            />
          )}
        </div>
      )}
    </div>
  );
}
