/**
 * src/lib/shared/result.ts
 * Unified Result<T> envelope for MediScan server functions.
 * Expected operational failures are returned as values rather than throwing exceptions,
 * ensuring error codes and messages survive cross-boundary production serialization.
 */

export type ErrorCode =
  | "AUTH_REQUIRED"
  | "RATE_LIMITED"
  | "INPUT_INVALID"
  | "AI_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "AI_BAD_OUTPUT"
  | "NO_FINDINGS"
  | "INTERNAL";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string };

export function okResult<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function errResult<T = never>(
  code: ErrorCode,
  message: string,
): Result<T> {
  return { ok: false, code, message };
}
