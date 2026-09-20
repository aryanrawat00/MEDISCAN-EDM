/**
 * src/components/medicine/DrugInteractionChecker.tsx
 * M07: Deterministic Drug Interaction Checker Component.
 * Integrates into Medicine Lens to check multiple medications against approved openFDA reference records.
 * Evidence first. Zero LLM hallucinations. Never falsely claims safety.
 */

import React, { useState, useEffect } from "react";
import {
  checkDrugInteractions,
  InteractionCheckResult,
  MAX_INTERACTION_MEDICINES,
  INTERACTION_DISCLAIMER,
} from "@/lib/medicine/interactions";
import { MEDICINE_REFERENCE_DATA, MedicineReferenceEntry } from "@/lib/medicine/reference.data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pill,
  ShieldAlert,
  AlertTriangle,
  Info,
  X,
  Plus,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  FileCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface DrugInteractionCheckerProps {
  initialMedicines?: string[];
  onMedicinesCountChange?: (count: number) => void;
  className?: string;
  autoScrollOnAdd?: boolean;
}

export function DrugInteractionChecker({
  initialMedicines = [],
  onMedicinesCountChange,
  className = "",
}: DrugInteractionCheckerProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>(initialMedicines);
  const [searchInput, setSearchInput] = useState("");
  const [result, setResult] = useState<InteractionCheckResult | null>(null);

  // Sync initial medicines if passed from parent
  useEffect(() => {
    if (initialMedicines.length > 0) {
      setSelectedMedicines((prev) => {
        const set = new Set([...prev, ...initialMedicines]);
        const updated = Array.from(set).slice(0, MAX_INTERACTION_MEDICINES);
        return updated;
      });
    }
  }, [initialMedicines]);

  useEffect(() => {
    onMedicinesCountChange?.(selectedMedicines.length);
  }, [selectedMedicines, onMedicinesCountChange]);

  const handleAddMedicine = (medName: string) => {
    const trimmed = medName.trim();
    if (!trimmed) return;

    if (selectedMedicines.length >= MAX_INTERACTION_MEDICINES) {
      toast.error(`Maximum limit of ${MAX_INTERACTION_MEDICINES} medicines reached.`);
      return;
    }

    const lower = trimmed.toLowerCase();
    const alreadyExists = selectedMedicines.some((m) => m.toLowerCase() === lower);
    if (alreadyExists) {
      toast.info(`"${trimmed}" is already in your interaction list.`);
      return;
    }

    const nextList = [...selectedMedicines, trimmed];
    setSelectedMedicines(nextList);
    setSearchInput("");
    setResult(null); // Reset results until user clicks check
    toast.success(`Added ${trimmed} to interaction list.`);
  };

  const handleRemoveMedicine = (indexToRemove: number) => {
    const removed = selectedMedicines[indexToRemove];
    const nextList = selectedMedicines.filter((_, idx) => idx !== indexToRemove);
    setSelectedMedicines(nextList);
    setResult(null);
    toast.info(`Removed ${removed}`);
  };

  const handleClearAll = () => {
    setSelectedMedicines([]);
    setResult(null);
    setSearchInput("");
    toast.info("Cleared all selected medicines.");
  };

  const handleRunCheck = () => {
    if (selectedMedicines.length < 2) {
      toast.error("Please select at least 2 medicines to check for interactions.");
      return;
    }

    const checkResult = checkDrugInteractions(selectedMedicines);
    setResult(checkResult);

    if (checkResult.summary.knownCount > 0) {
      toast.warning(
        `Found ${checkResult.summary.knownCount} verified interaction(s) across evaluated pairs.`,
      );
    } else {
      toast.info("No verified interactions found in the current MediScan reference set.");
    }
  };

  // Pre-approved medicines quick tags that aren't already selected
  const availableQuickPicks = MEDICINE_REFERENCE_DATA.filter(
    (m) =>
      !selectedMedicines.some(
        (sel) => sel.toLowerCase() === m.key || sel.toLowerCase() === m.displayName.toLowerCase(),
      ),
  );

  return (
    <section
      id="drug-interaction-checker"
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-foreground tracking-tight">
                Drug Interaction Checker
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Deterministic Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluate combinations against verified openFDA monograph labeling · Zero AI guessing
            </p>
          </div>
        </div>

        {selectedMedicines.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Clear List
          </Button>
        )}
      </div>

      {/* Selected Medicines Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground uppercase tracking-wider">
            Selected Medicines ({selectedMedicines.length} / {MAX_INTERACTION_MEDICINES})
          </span>
          <span className="text-muted-foreground">
            {selectedMedicines.length < 2
              ? "Select at least 2 to evaluate"
              : `${(selectedMedicines.length * (selectedMedicines.length - 1)) / 2} pair(s) to evaluate`}
          </span>
        </div>

        {selectedMedicines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
            <Pill className="h-6 w-6 mx-auto mb-2 text-muted-foreground/60" />
            <p className="font-medium text-foreground">No medicines selected yet</p>
            <p className="mt-1">
              Add medicines using the search box below, select from quick tags, or click "Add to Interaction Check" from any scanned medicine.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedMedicines.map((med, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs animate-in fade-in"
              >
                <Pill className="h-3.5 w-3.5 text-primary" />
                <span>{med}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={`Remove ${med}`}
                  aria-label={`Remove ${med}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medicine Input & Quick Pickers */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMedicine(searchInput);
                }
              }}
              placeholder="Type medicine name or brand (e.g. Aspirin, Ibuprofen, Tylenol, Omeprazole)..."
              disabled={selectedMedicines.length >= MAX_INTERACTION_MEDICINES}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAddMedicine(searchInput)}
            disabled={!searchInput.trim() || selectedMedicines.length >= MAX_INTERACTION_MEDICINES}
            className="text-xs"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {/* Quick Suggestion Chips */}
        {availableQuickPicks.length > 0 && selectedMedicines.length < MAX_INTERACTION_MEDICINES && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px] mr-1">Quick Add:</span>
            {availableQuickPicks.slice(0, 6).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => handleAddMedicine(m.displayName)}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
              >
                <Plus className="h-3 w-3" />
                {m.displayName.split(" ")[0]}
              </button>
            ))}
          </div>
        )}

        {/* Check Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleRunCheck}
            disabled={selectedMedicines.length < 2}
            className="w-full sm:w-auto brand-gradient text-white shadow-sm font-semibold text-xs sm:text-sm px-6 h-10"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Check Interactions ({selectedMedicines.length}{" "}
            {selectedMedicines.length === 1 ? "medicine" : "medicines"})
          </Button>
        </div>
      </div>

      {/* Interaction Results Section */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-border animate-in fade-in">
          {/* Summary Banner */}
          <div className="rounded-xl bg-muted/30 p-4 border border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">
                  Interaction Check Evaluation
                </h3>
                <p className="text-xs text-muted-foreground">
                  {result.totalMedicines} medicines evaluated · {result.totalPairs} unique medicine{" "}
                  {result.totalPairs === 1 ? "pair" : "pairs"} analyzed
                </p>
              </div>

              {/* Status Metrics */}
              <div className="flex items-center gap-2">
                {result.summary.majorCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {result.summary.majorCount} Major
                  </span>
                )}
                {result.summary.moderateCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {result.summary.moderateCount} Moderate
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-500/20">
                  <Info className="h-3.5 w-3.5" />
                  {result.summary.notFoundCount} Not in reference set
                </span>
              </div>
            </div>
          </div>

          {/* Pair Evaluation Cards */}
          <div className="space-y-4">
            {result.pairs.map((pair, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 transition-all ${
                  pair.status === "known"
                    ? pair.severity === "major"
                      ? "border-rose-500/40 bg-rose-500/[0.03]"
                      : "border-amber-500/40 bg-amber-500/[0.03]"
                    : "border-border/80 bg-card"
                }`}
              >
                {/* Pair Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {pair.medicineADisplay}
                    </span>
                    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-bold text-sm text-foreground">
                      {pair.medicineBDisplay}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {pair.status === "known" ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        pair.severity === "major"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {pair.severity === "major" ? (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {pair.severity === "major" ? "Major Interaction" : "Moderate Interaction"}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                      <Info className="h-3.5 w-3.5" />
                      <span>No verified interaction found</span>
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="mt-3 space-y-3 text-xs leading-relaxed">
                  {pair.category && (
                    <div>
                      <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                        Clinical Category:
                      </span>
                      <p className="font-medium text-foreground mt-0.5">{pair.category}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Reference Explanation:
                    </span>
                    <p className="text-foreground mt-0.5">{pair.description}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Why It Matters:
                    </span>
                    <p className="text-muted-foreground mt-0.5">{pair.whyItMatters}</p>
                  </div>

                  {pair.evidence && (
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                      <div className="flex items-center gap-1 font-semibold text-foreground text-[11px] mb-1">
                        <FileCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Supporting Monograph Evidence</span>
                      </div>
                      <blockquote className="italic text-muted-foreground font-mono text-[11px]">
                        "{pair.evidence}"
                      </blockquote>
                      {pair.source && (
                        <p className="text-[10px] text-muted-foreground/80 mt-1.5 font-sans">
                          Source: {pair.source}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Safety Guidance Note */}
                  <div
                    className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      pair.status === "known"
                        ? "bg-amber-500/10 text-amber-900 dark:text-amber-300"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {pair.safetyNote}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Safety Disclaimer */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Evidence-First Reference Notice</span>
            </div>
            <p>{result.disclaimer}</p>
          </div>
        </div>
      )}
    </section>
  );
}
