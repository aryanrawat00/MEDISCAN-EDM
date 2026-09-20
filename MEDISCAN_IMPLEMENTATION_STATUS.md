# MEDISCAN — IMPLEMENTATION STATUS

> **Phase 0 — Repository Audit + Baseline**
> Audited: 2026-09-20 · Auditor: Antigravity · Baseline commit: `bb4d23a` ("Initial commit")

---

## 1. Repository Snapshot

| Item | Value |
|---|---|
| **Branch** | `master` (single branch; `brief/dev` not yet created) |
| **Commits** | 1 — `bb4d23a Initial commit` |
| **Node** | ≥ 22.x (npm installed OK with F-drive cache) |
| **npm install** | ✅ passes (npm cache redirected to `F:\npm-cache` due to C drive < 1 GB free) |
| **node_modules** | 293 packages present |
| **Lock file** | `package-lock.json` (307 KB) + stale `bun.lock` — **two lock files (Finding F-07)** |
| **.env** | ❌ missing |
| **.env.example** | ❌ missing |
| **.gitignore** | only `node_modules` — incomplete |
| **README.md** | 11 bytes — placeholder |

---

## 2. Architecture Overview (What Exists)

| Layer | Technology | Status |
|---|---|---|
| **Framework** | TanStack Start (React 19 + TanStack Router + Nitro SSR) | ✅ Present |
| **Styling** | Tailwind CSS 4 + shadcn/ui (46 components) | ✅ Present |
| **AI** | Vercel AI SDK (`ai` 7.0) + `@ai-sdk/google` → Gemini 2.5 Flash | ✅ Present |
| **Auth** | Supabase Auth (Google OAuth) with `AuthProvider` + `AuthGate` | ✅ Present |
| **Database** | Supabase Postgres (RLS, `profiles` + `analyses` tables) | ✅ Schema present |
| **State** | Zustand (declared dep, not yet used); React Query for server state | ✅ Present |
| **Build** | Vite 8 + `@lovable.dev/vite-tanstack-config` | ✅ Present |
| **Hosting target** | Cloudflare Workers (via Nitro in Lovable config) | ✅ Configured |

---

## 3. Existing Routes & Features

| Route | File | Feature | Status |
|---|---|---|---|
| `/` | `index.tsx` | Landing page (hero, features, testimonials, CTA) | ✅ Complete |
| `/login` | `login.tsx` | Google sign-in page | ✅ Complete |
| `/auth/callback` | `auth.callback.tsx` | OAuth redirect handler | ✅ Complete |
| `/analyzer` | `analyzer.tsx` | Report text paste/upload → AI analysis → save | ✅ Working (basic) |
| `/symptoms` | `symptoms.tsx` | Symptom checker → AI analysis → save | ✅ Working |
| `/medicines` | `medicines.tsx` | Medicine name lookup → AI info → save | ✅ Working (text only) |
| `/dashboard` | `dashboard.tsx` | User dashboard with recent analyses | ⚠️ **TS error** (uses `a.kind`) |
| `/history` | `history.tsx` | Analysis history list with expand/delete | ⚠️ **TS errors** (uses `a.kind`, `a.input`) |
| `/profile` | `profile.tsx` | User profile display | ✅ Present |
| `/settings` | `settings.tsx` | App settings (theme, data management) | ✅ Present |
| `/about` | `about.tsx` | About page | ✅ Present |
| `/contact` | `contact.tsx` | Contact form | ✅ Present |

---

## 4. TypeScript Errors (3 — matches blueprint prediction)

```
src/routes/dashboard.tsx(111,26): error TS2339: Property 'kind' does not exist on type 'AnalysisRow'.
src/routes/history.tsx(68,28): error TS2339: Property 'kind' does not exist on type 'AnalysisRow'.
src/routes/history.tsx(98,14): error TS2339: Property 'input' does not exist on type 'AnalysisRow'.
```

**Root cause (F-01 — Column Drift):** The `AnalysisRow` type in `lib/analyses.ts` uses `type` and `input_text`, but the DB schema uses `kind` and `input`. Dashboard and History reference the old names `kind` and `input`.

**Additional drift:** The `AnalysisRow` type declares `file_path?: string | null` but the DB schema has no `file_path` column. The `analyses.ts` insert uses `type` and `input_text` (matching the TypeScript type) but the DB schema columns are `kind` and `input`.

---

## 5. Findings vs V3 Blueprint

### 5.1 Critical Findings (from Blueprint §4)

| ID | Finding | Status | Blueprint Reference |
|---|---|---|---|
| **F-01** | Column name drift between TypeScript types and DB schema (`kind`/`type`, `input`/`input_text`) | ⚠️ **Confirmed** — causes 3 TS errors | §4.3 F-01, §16.2 |
| **F-07** | Two lock files (`package-lock.json` + `bun.lock`) | ⚠️ **Confirmed** | §4.3 F-07 |
| **F-16** | Hardcoded Gemini model (`gemini-2.5-flash`) with no fallback list | ⚠️ **Confirmed** — `ai.functions.ts` L6 | §4.3 F-16 |
| **F-xx** | No `.env.example`, no `.env`, minimal `.gitignore`, placeholder README | ⚠️ **Confirmed** | §28.2 T01 |
| **F-xx** | No `typecheck` or `test` scripts in `package.json` | ⚠️ **Confirmed** — only `dev`/`build`/`preview`/`lint`/`format` | §28.2 T01 |
| **F-xx** | No test framework installed (no `vitest`) | ⚠️ **Confirmed** | §7.2, §28.1 |

### 5.2 AI Architecture Gaps

| Blueprint Requirement | Current State | Priority |
|---|---|---|
| **Evidence-locked extraction** — AI extracts, code verifies | ❌ Missing — AI returns unverified JSON directly | P0 |
| **Deterministic engine** (`engine.ts`) — code classifies LOW/NORMAL/HIGH | ❌ Missing — AI does all classification | P0 |
| **Evidence verification** (`evidence.ts`) — quote-matching | ❌ Missing | P0 |
| **Pipeline** (`pipeline.ts`) — eligibility, dedup, stats, trace | ❌ Missing | P0 |
| **Report normalization** (`normalize.ts`) — text index mapping | ❌ Missing | P0 |
| **Server-side auth middleware** on AI functions | ❌ Missing — `createServerFn` has no auth check | P0 |
| **PDF text extraction** (`pdfLines.ts`, `pdfjs-dist`) | ❌ Missing — only text paste + .txt upload | P0 |
| **Tamper Test** / Verification Lab | ❌ Missing | P0 |
| **Doctor Visit Brief** | ❌ Missing | P0 |
| **Demo Mode** (`/demo` route, offline, no auth) | ❌ Missing | P0 |

### 5.3 Medicine Lens Gaps

| Blueprint Requirement | Current State | Priority |
|---|---|---|
| **Photo/image upload** for medicine identification | ❌ Missing — text name input only | P0 |
| **Evidence-based identification** with quotes | ❌ Missing — AI generates freely | P0 |
| **Reference snapshot** (openFDA/reviewed data) | ❌ Missing — AI invents information | P0 |
| **User confirmation** before showing reference info | ❌ Missing | P0 |
| **Mandatory safety sentence** on every result | ❌ Missing (only generic AI disclaimer) | P0 |
| **Status chips** (VERIFIED/UNVERIFIED/NEEDS_CONFIRMATION/UNKNOWN) | ❌ Missing | P0 |
| **Image validation** (MIME, magic bytes, size) | ❌ Missing | P0 |
| **Expiry detection** | ❌ Missing | P1 |
| **Duplicate-ingredient detection** | ❌ Missing | P1 |

### 5.4 What Works and Should Be Preserved

| Feature | File(s) | Notes |
|---|---|---|
| Supabase client + graceful unconfigured fallback | `lib/supabase.ts` | Proxy stub is a good pattern |
| Auth context + AuthGate + Google OAuth flow | `lib/auth-context.tsx`, `components/AuthGate.tsx` | Solid, keep as-is |
| Theme context (light/dark with local storage) | `lib/theme-context.tsx` | Keep as-is |
| Navbar with responsive layout + user menu | `components/Navbar.tsx` | Will need link updates |
| Landing page (polished, well-structured) | `routes/index.tsx` | Needs copy updates only |
| shadcn/ui component library (46 components) | `components/ui/` | Keep all, reuse heavily |
| Server error wrapper with error page | `server.ts`, `lib/error-page.ts`, `lib/error-capture.ts` | Keep as-is |
| Error reporting to Lovable | `lib/lovable-error-reporting.ts` | Keep as-is |
| Basic `saveAnalysis` / `listAnalyses` / `deleteAnalysis` | `lib/analyses.ts` | Fix column drift, then extend |
| Zod-validated AI JSON parsing | `lib/ai.functions.ts` `generateJson()` | Good pattern to keep |
| Route-level `head()` with meta tags | All routes | Keep, update titles |

---

## 6. Security Assessment

| Check | Status | Action |
|---|---|---|
| Server-side auth on AI endpoints | ❌ None | T04: Add auth middleware |
| RLS on Supabase tables | ✅ Present | Verify policies match |
| No secrets in client bundle | ⚠️ `GEMINI_API_KEY` accessed via `process.env` (server-side OK, but needs `.env`) | Create `.env.example` |
| Supabase keys via `import.meta.env.VITE_*` | ✅ Client-safe (anon key) | OK by design |
| Input validation on AI functions | ✅ Zod schemas on inputs | Keep |
| File upload validation | ⚠️ Only `.txt` MIME check, no magic bytes | T01: Enhance |

---

## 7. Dependency Assessment

| Dependency | Purpose | Blueprint Status |
|---|---|---|
| `@ai-sdk/google` + `ai` | Gemini integration | ✅ Keep |
| `@supabase/supabase-js` | Auth + DB | ✅ Keep |
| `@tanstack/react-router` + `react-start` | Framework | ✅ Keep |
| `tailwindcss` + `tw-animate-css` | Styling | ✅ Keep |
| `recharts` | Charts (unused?) | ⚠️ Audit usage |
| `react-hook-form` + `@hookform/resolvers` | Forms (unused?) | ⚠️ Audit usage |
| `zustand` | State (unused) | ⚠️ May be removed |
| **Missing: `pdfjs-dist`** | PDF text extraction | ❌ Need to add |
| **Missing: `vitest`** | Testing | ❌ Need to add |

---

## 8. Checklist — Phase 0 Complete

- [x] Repository audited against V3 Blueprint
- [x] `npm install` succeeds (with F-drive cache workaround)
- [x] TypeScript errors cataloged (3 known, matching blueprint)
- [x] All existing files inventoried
- [x] Column drift confirmed (F-01)
- [x] Two lock files confirmed (F-07)
- [x] All blueprint gaps documented
- [x] What-to-keep vs what-to-build identified
- [x] Implementation status document created
- [x] Handoff document created

---

## 9. Next Steps (Phase 1 — Do NOT start without approval)

The implementation should follow **§28.2 exactly**, starting with:

1. **T00** — Baseline: `.env.example`, `vite dev` test, `scripts/check-model.mjs`, branch `brief/dev`, tag `baseline`
2. **M01a** — Reference build script (medicine snapshot)
3. **T01** — Hygiene: `.gitignore`, `.env.example`, README, scripts, `vitest`, smoke test
4. **T02** — Fix column drift (Path A/B/C per §16.2)
5. **T03** — Retire legacy symptom checker + LLM-only medicine lookup
6. **T04** — Auth middleware on server functions

> **STOP** — awaiting instruction before proceeding to Phase 1.
