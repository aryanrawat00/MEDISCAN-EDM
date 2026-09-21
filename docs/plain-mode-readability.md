# Plain mode readability upgrade

## Audit and scope

The existing screens are `src/components/report/EvidenceVerificationModal.tsx` and
`src/components/medicine/MonographView.tsx`, with the selected-medicine reference
subtitle in `src/routes/medicines.tsx`. `RangeBar.tsx` provides the unchanged
visualization. `FindingsTable.tsx` provides the existing Simple/Detailed pill
pattern; its state is local `useState`, not persistent. The engine already
produces LOW, NORMAL, HIGH, UNKNOWN and detailed status reasons.

Medicine warnings are strings, not categorized records. The reference build
script produces PENDING snapshots, which require human approval before being
marked APPROVED. There is no separate review UI for explanatory copy.

The user approved two adaptations: use the existing pill styling with a shared
localStorage preference, and introduce an exact-source warning-to-template
mapping. Plain is the default, including guests. The preference is shared between
both screens, synchronizes across tabs, and falls back to session memory when
storage is denied. No new state library is used.

## Files changed

- `src/components/report/EvidenceVerificationModal.tsx`: range bar, mode-dependent copy, truthful audit checks.
- `src/components/medicine/MonographView.tsx`: summaries, original wording disclosures, source details and review credit.
- `src/routes/medicines.tsx`: reference subtitle only, plus suppressing its duplicate inside the selected card.
- `src/components/PresentationModeToggle.tsx`: reusable existing pill pattern.
- `src/lib/presentation-mode.ts`: shared saved preference.
- `src/lib/report/plain-copy.ts`: fixed templates selected by existing status/reason.
- `src/lib/medicine/warning-copy.ts`: exact-source mappings to supplied templates.
- `tests/report/plain-copy.test.ts`: statuses, special intervals and failed verification.
- `tests/report/evidence-modal.test.ts`: both modes, source preservation, notation and audit.
- `tests/medicine/warning-copy.test.ts`: every snapshot warning in both modes, review gating, unknown text fallback.
- `tests/presentation-mode.test.ts`: defaults, persistence, synchronization, denied storage.
- `docs/plain-mode-readability.md`: this implementation and review record.

The landing page, navigation, branding, findings cards/table, sample cards,
interaction checker and classification engine are unchanged. Existing unrelated
working-tree edits were preserved.

## Before and after

Technical mode preserves the existing notation. Plain mode shows these supplied
sentences, with the existing RangeBar directly above them:

| Finding | Before (also retained in Technical) | After in Plain |
| --- | --- | --- |
| Within | `Lower boundary (70) ≤ Value (92) ≤ Upper boundary (99)` | 92 mg/dL sits between the low (70) and high (99) numbers your lab printed, so it's marked Within range. |
| Below | `Value (60) < lower reference boundary (70)` | 60 mg/dL is lower than the low number your lab printed (70), so it's marked Below range. |
| Above | `Value (110) > upper reference boundary (99)` | 110 mg/dL is higher than the high number your lab printed (99), so it's marked Above range. |
| Unclassified | Technical reason, such as no printed numerical interval | MediScan couldn't compare this result to a clear range from your report, so it's shown as unclassified rather than guessed. |

The incorrect audit line "Value matches extracted data outside range boundaries"
is removed. Technical mode confirms that both value and range were found only
when the source is available and the quote, value, range and verification checks
all support that claim. Failed checks receive an amber information icon and
explicitly state that they could not be confirmed. Plain mode uses the supplied
numeric trust sentence only for verified numeric comparisons; other results use
"A fixed rule — not AI — produced the status shown above."

| Medicine example | Before | After in both modes |
| --- | --- | --- |
| Mapped liver warning | Hepatotoxicity Warning: Severe liver damage risk with acute overdose or concomitant acetaminophen use exceeding 4,000 mg/day. | Bold lead: "Taking too much of this, or combining it with another medicine that also contains acetaminophen, can seriously harm your liver." Exact original retained under "Official FDA wording". |
| Unmapped cardiovascular/GI warning | Cardiovascular and Gastrointestinal Risk: Increased risk of serious cardiovascular thrombotic events and gastrointestinal ulceration/bleeding. | Identical text, labeled "Official FDA wording"; no invented lead. |
| Review credit | Reviewed by clinical-pharmacology-reviewer | Checked against the official FDA label. (Only for APPROVED snapshots.) |

Mapped originals may be collapsed in Plain and are expanded in Technical.
Unmapped originals are always visible. Stronger prohibitions and compound
warnings (duplicate ingredients, alcohol/sedatives, dose adjustment) remain
visible beside their summaries in both modes. Report quotes are always visible.
The complete source name and Set ID are available through one Details disclosure
in Plain and inline in Technical; the existing external link stays unchanged.

## Exceptions and review queue

The supplied report templates assume exact numeric values and inclusive,
two-sided intervals. One-sided, exclusive, inequality and classified qualitative
results retain the engine's existing explanation. They are not reclassified.

The brief both prohibits introducing stop-use advice and supplies a skin-reaction
template with that wording. That template is used only for the exact source
warning that already explicitly instructs stop-use and immediate medical help.
It is not applied to ibuprofen allergy text with different symptoms.

The supplied alcohol lead does not express all restrictions in the existing
warnings, so their stronger original wording remains visible. These mappings
use the sentences supplied by the user; no new clinical review or FDA endorsement
of the summaries is claimed. Future source changes fall back to verbatim-only.

Fifteen exact warning passages map to the five supplied categories. Fourteen
passages remain verbatim-only pending human-approved plain copy:

- Ibuprofen: severe allergy with hives/swelling/wheezing/shock; stomach bleeding;
  heart attack/stroke/heart failure; heart surgery restriction; boxed cardiovascular/GI risk.
- Cetirizine: driving and machinery/drowsiness warning.
- Diphenhydramine: marked drowsiness and driving prohibition.
- Loratadine: excess-dose/drowsiness warning.
- Phenylephrine and dextromethorphan: MAOI restrictions.
- Aspirin: Reye's syndrome warning and boxed warning; stomach bleeding.
- Omeprazole: treatment-duration restriction.

To add a summary, a human reviewer should confirm its exact source text, select
or approve a fixed template and parameters, and review it alongside the reference
snapshot's PENDING → APPROVED process. Do not mark a snapshot or new sentence
approved automatically. Add coverage for changed wording and ensure the original
is always reachable. No runtime LLM is involved in this presentation layer.

New copy follows the existing English fallback behavior; no unreviewed medical
translations were introduced. The optional glossary was intentionally omitted.

## Validation

- `npm run typecheck`: passed.
- `npm test`: 198 tests across 18 files passed (53 new regression tests).
- `npm run build`: passed; existing Vite/TanStack deprecation advisories remain.
- `git diff --check`: passed.
- Browser: Plain/Technical report content, unchanged quotes, shared preference
  between screens, persistence after reload, keyboard toggles, one-action FDA
  wording and source-details disclosures, and unmapped warning visibility checked.
- Phone-width preview: report dialog, reference card, warnings and source footer
  inspected at 390 px. Plain mode retains the shorter default warning presentation;
  stronger original prohibitions remain visible as documented above.
