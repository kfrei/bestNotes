/**
 * Gemini API Key 1 Health Probe & Key Status Service
 * Domain: Admin AI Analytics & 6-Hour Automated API 1 Reset Verification
 *
 * Never hardcodes any API keys; reads exclusively via geometryAndAlgorithms helpers.
 */

import {
  GEMINI_API1_PROBE_INTERVAL_MS,
  type GeminiApi1ProbeResult,
  type GeminiApi1ProbeStatus,
} from '../types';
import {
  getActiveGeminiApiKeySlot,
  getGeminiApi1Key,
  getGeminiApi2Key,
  type GeminiApiKeySlot,
} from '../../../utils/geometryAndAlgorithms';

export const GEMINI_API1_PROBE_STORAGE_KEY = 'bestnotes_gemini_api1_probe_v1';
export const GEMINI_API1_PROBE_MODEL = 'gemini-3-flash-preview';
export const GEMINI_API1_PROBE_ERROR_RETRY_MS = 15 * 60 * 1000; // 15 min retry backoff for transient network/5xx errors

let inFlightProbe: Promise<GeminiApi1ProbeResult> | null = null;

function isValidProbeStatus(val: unknown): val is GeminiApi1ProbeStatus {
  return (
    val === 'ok' ||
    val === 'depleted_402' ||
    val === 'rate_limited_429' ||
    val === 'error'
  );
}

/**
 * Reads the persisted API 1 health probe result from localStorage.
 */
export function loadApi1ProbeResult(): GeminiApi1ProbeResult | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(GEMINI_API1_PROBE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !isValidProbeStatus(parsed.status) ||
      typeof parsed.httpCode !== 'number' ||
      typeof parsed.message !== 'string' ||
      typeof parsed.checkedAt !== 'string' ||
      typeof parsed.nextCheckAt !== 'string'
    ) {
      return null;
    }
    return {
      status: parsed.status,
      httpCode: parsed.httpCode,
      message: parsed.message,
      model: typeof parsed.model === 'string' ? parsed.model : GEMINI_API1_PROBE_MODEL,
      checkedAt: parsed.checkedAt,
      nextCheckAt: parsed.nextCheckAt,
    };
  } catch {
    return null;
  }
}

/**
 * Persists an API 1 health probe result in localStorage.
 */
export function saveApi1ProbeResult(result: GeminiApi1ProbeResult): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(GEMINI_API1_PROBE_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // ignore storage quota / privacy mode errors
  }
}

/**
 * Returns true if no probe has been recorded yet or the 6-hour cooldown has elapsed.
 */
export function isApi1ProbeDue(
  stored: GeminiApi1ProbeResult | null,
  nowMs = Date.now()
): boolean {
  if (!stored) return true;
  const nextMs = Date.parse(stored.nextCheckAt);
  if (Number.isNaN(nextMs)) return true;
  return nowMs >= nextMs;
}

/**
 * Returns which API keys are configured in the environment without exposing secrets.
 */
export function getGeminiKeyAvailability(): {
  hasApi1: boolean;
  hasApi2: boolean;
  activeSlot: GeminiApiKeySlot;
} {
  return {
    hasApi1: Boolean(getGeminiApi1Key()),
    hasApi2: Boolean(getGeminiApi2Key()),
    activeSlot: getActiveGeminiApiKeySlot(),
  };
}

/**
 * Formats remaining time until next 6-hour probe in compact Greek (e.g. "σε 5ω 42λ").
 */
export function formatProbeCountdown(nextCheckAt: string, nowMs = Date.now()): string {
  const targetMs = Date.parse(nextCheckAt);
  if (Number.isNaN(targetMs)) return 'Εκκρεμεί';
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return 'Εκκρεμεί τώρα';
  const totalMinutes = Math.ceil(diffMs / 60000);
  if (totalMinutes < 1) return 'σε <1λ';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `σε ${minutes}λ`;
  if (minutes === 0) return `σε ${hours}ω`;
  return `σε ${hours}ω ${minutes}λ`;
}

/**
 * Sends a tiny lightweight probe to `gemini-3-flash-preview` using API Key 1
 * (`VITE_GV_A`/`VITE_GV_B`) to verify whether API 1 ever resets from HTTP 402.
 *
 * When `force` is false (default), returns the cached result if < 6 hours old.
 */
export async function probeGeminiApi1Health(options?: {
  force?: boolean;
  timeoutMs?: number;
}): Promise<GeminiApi1ProbeResult> {
  const force = Boolean(options?.force);
  const timeoutMs = options?.timeoutMs ?? 12000;

  if (!force) {
    const cached = loadApi1ProbeResult();
    if (cached && !isApi1ProbeDue(cached)) {
      return cached;
    }
  }

  if (inFlightProbe) {
    return inFlightProbe;
  }

  inFlightProbe = (async (): Promise<GeminiApi1ProbeResult> => {
    const nowMs = Date.now();
    const checkedAt = new Date(nowMs).toISOString();
    const nextCheckAt = new Date(nowMs + GEMINI_API1_PROBE_INTERVAL_MS).toISOString();

    const api1Key = getGeminiApi1Key();
    if (!api1Key) {
      const missingResult: GeminiApi1ProbeResult = {
        status: 'error',
        httpCode: 0,
        message: 'Δεν βρέθηκε API Key 1 στο περιβάλλον (VITE_GV_A / VITE_GV_B).',
        model: GEMINI_API1_PROBE_MODEL,
        checkedAt,
        nextCheckAt,
      };
      saveApi1ProbeResult(missingResult);
      return missingResult;
    }

    const controller = new AbortController();
    const timer =
      typeof window !== 'undefined'
        ? window.setTimeout(() => controller.abort(), timeoutMs)
        : setTimeout(() => controller.abort(), timeoutMs);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API1_PROBE_MODEL}:generateContent?key=${encodeURIComponent(api1Key)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }],
          generationConfig: {
            maxOutputTokens: 4,
            temperature: 0,
          },
        }),
      });

      let apiMessage = '';
      try {
        const data = await res.json();
        apiMessage =
          typeof data?.error?.message === 'string'
            ? data.error.message.trim()
            : '';
      } catch {
        // ignore non-JSON body
      }

      let status: GeminiApi1ProbeStatus;
      let message: string;

      if (res.ok) {
        status = 'ok';
        message = 'HTTP 200 — Το API Key 1 απάντησε κανονικά (ενεργό / έκανε reset).';
      } else if (res.status === 402) {
        status = 'depleted_402';
        message =
          apiMessage ||
          'Your prepayment credits are depleted (HTTP 402).';
      } else if (res.status === 429) {
        status = 'rate_limited_429';
        message =
          apiMessage ||
          'Όριο ρυθμού ή ημερήσιο quota εξαντλημένο (HTTP 429).';
      } else {
        status = 'error';
        message = apiMessage || `HTTP ${res.status} (${res.statusText || 'Error'})`;
      }

      const isTransientServerError = res.status >= 500;
      const result: GeminiApi1ProbeResult = {
        status,
        httpCode: res.status,
        message,
        model: GEMINI_API1_PROBE_MODEL,
        checkedAt,
        nextCheckAt: isTransientServerError
          ? new Date(nowMs + GEMINI_API1_PROBE_ERROR_RETRY_MS).toISOString()
          : nextCheckAt,
      };
      saveApi1ProbeResult(result);
      return result;
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      const result: GeminiApi1ProbeResult = {
        status: 'error',
        httpCode: 0,
        message: isAbort
          ? `Timeout (${Math.round(timeoutMs / 1000)}s) κατά τον έλεγχο του API 1.`
          : `Σφάλμα δικτύου: ${err?.message || 'Αποτυχία σύνδεσης'}`,
        model: GEMINI_API1_PROBE_MODEL,
        checkedAt,
        nextCheckAt: new Date(nowMs + GEMINI_API1_PROBE_ERROR_RETRY_MS).toISOString(),
      };
      saveApi1ProbeResult(result);
      return result;
    } finally {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timer as number);
      } else {
        clearTimeout(timer);
      }
      inFlightProbe = null;
    }
  })();

  return inFlightProbe;
}
