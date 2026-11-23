import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';

admin.initializeApp();
const db = admin.firestore();

const PROJECT_ID = 'bestnotes-2026';
const ADMIN_EMAIL = 'freiderikoskostas@gmail.com';

const GOOGLE_OAUTH_CLIENT_ID = defineString('GOOGLE_OAUTH_CLIENT_ID', {
  default: '867655609873-t8lm31dtq13mkmeuc5tkn8t0odum0bhf.apps.googleusercontent.com',
});
const GOOGLE_OAUTH_CLIENT_SECRET = defineSecret('GOOGLE_OAUTH_CLIENT_SECRET');

const ALLOWED_CORS_ORIGINS = [
  'https://explainboards.web.app',
  'https://explainboards.firebaseapp.com',
  'https://mybestnotes.web.app',
  'https://mybestnotes.firebaseapp.com',
  'https://bestnotes-2026.web.app',
  'https://bestnotes-2026.firebaseapp.com',
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

function getUtcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

async function recordServerFunctionMetric(
  fields: Record<string, number>
): Promise<void> {
  try {
    const today = getUtcDateString();
    const payload: Record<string, unknown> = {
      date: today,
      updatedAt: new Date().toISOString(),
    };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== 0) {
        payload[k] = admin.firestore.FieldValue.increment(v);
      }
    }
    await db.collection('firebase_usage_daily').doc(today).set(payload, { merge: true });
  } catch {
    // Non-blocking telemetry
  }
}

async function fetchGoogleUserInfoEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { email?: string };
    return json.email || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves an OAuth2 access token for the Cloud Functions runtime service account
 * so we can read official Google Cloud Monitoring v3 billable metrics (`monitoring.timeSeries.list`).
 */
async function getRuntimeServiceAccountToken(): Promise<string | null> {
  try {
    const metaRes = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      { headers: { 'Metadata-Flavor': 'Google' } }
    );
    if (metaRes.ok) {
      const metaJson = (await metaRes.json()) as { access_token?: string };
      if (metaJson.access_token) return metaJson.access_token;
    }
  } catch {
    // Fallback to Admin SDK credential outside Cloud Run metadata environment
  }
  try {
    const cred = admin.app().options.credential;
    if (cred && typeof cred.getAccessToken === 'function') {
      const tok = await cred.getAccessToken();
      if (tok?.access_token) return tok.access_token;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Called ONCE when the user connects Google Drive (GoodNotes-style offline OAuth2 authorization code exchange).
 * Stores the long-lived `refresh_token` in server-only Firestore (`drivePrivateTokens/{uid}`)
 * so neither iPad nor Mac mini ever needs to open an OAuth popup window again.
 */
export const exchangeDriveAuthCode = onCall(
  {
    region: 'europe-west1',
    cors: ALLOWED_CORS_ORIGINS,
    secrets: [GOOGLE_OAUTH_CLIENT_SECRET],
    maxInstances: 3,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Απαιτείται σύνδεση χρήστη.');
    }

    void recordServerFunctionMetric({ fnTotalCalls: 1, fnDriveAuthExchanges: 1 });

    const code = typeof request.data?.code === 'string' ? request.data.code.trim() : '';
    const redirectUri =
      typeof request.data?.redirectUri === 'string' && request.data.redirectUri.trim()
        ? request.data.redirectUri.trim()
        : 'postmessage';

    if (!code) {
      throw new HttpsError('invalid-argument', 'Λείπει ο κωδικός εξουσιοδότησης (code).');
    }

    const clientId = GOOGLE_OAUTH_CLIENT_ID.value().trim();
    const clientSecret = GOOGLE_OAUTH_CLIENT_SECRET.value().trim();
    if (!clientId || !clientSecret) {
      throw new HttpsError('failed-precondition', 'Λείπουν τα Google OAuth credentials στον server.');
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new HttpsError(
        'permission-denied',
        tokenData.error_description || tokenData.error || 'Αποτυχία ανταλλαγής κωδικού Google Drive.'
      );
    }

    const now = Date.now();
    const expiresInSec = Number(tokenData.expires_in || 3599);
    const expiresAtMs = now + expiresInSec * 1000;
    const email =
      (await fetchGoogleUserInfoEmail(tokenData.access_token)) ||
      (typeof request.auth?.token?.email === 'string' ? request.auth.token.email : '') ||
      '';

    const privateRef = db.collection('drivePrivateTokens').doc(uid);
    const existingPrivateSnap = await privateRef.get();
    const existingRefreshToken = existingPrivateSnap.exists
      ? (existingPrivateSnap.data()?.refreshToken as string | undefined)
      : undefined;
    const finalRefreshToken = tokenData.refresh_token || existingRefreshToken || '';

    if (!finalRefreshToken) {
      throw new HttpsError(
        'failed-precondition',
        'Η Google δεν επέστρεψε refresh_token. Δοκιμάστε ξανά με επιλογή λογαριασμού.'
      );
    }

    await privateRef.set(
      {
        refreshToken: finalRefreshToken,
        cachedAccessToken: tokenData.access_token,
        cachedExpiresAtMs: expiresAtMs,
        email,
        scope: tokenData.scope || '',
        updatedAt: new Date(now).toISOString(),
      },
      { merge: true }
    );

    await db
      .collection('users')
      .doc(uid)
      .set(
        {
          driveOfflineLinked: true,
          ...(email ? { driveEmail: email } : {}),
          driveAccessTokenV3: tokenData.access_token,
          driveTokenIssuedAtV3: now,
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );

    return {
      accessToken: tokenData.access_token,
      expiresAtMs,
      issuedAt: now,
      email,
      offlineLinked: true,
    };
  }
);

/**
 * Silent background Google Drive token refresher (0 popups, 0 window.open, works across Mac mini & iPad PWA!).
 * Returns a cached valid access_token or exchanges the server-stored refresh_token in ~80ms.
 */
export const getFreshDriveAccessToken = onCall(
  {
    region: 'europe-west1',
    cors: ALLOWED_CORS_ORIGINS,
    secrets: [GOOGLE_OAUTH_CLIENT_SECRET],
    maxInstances: 3,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Απαιτείται σύνδεση χρήστη.');
    }

    const forceRefresh = Boolean(request.data?.forceRefresh);
    const privateRef = db.collection('drivePrivateTokens').doc(uid);
    const snap = await privateRef.get();
    if (!snap.exists) {
      void recordServerFunctionMetric({ fnTotalCalls: 1 });
      throw new HttpsError('not-found', 'NO_DRIVE_REFRESH_TOKEN');
    }

    const docData = snap.data() || {};
    const refreshToken = typeof docData.refreshToken === 'string' ? docData.refreshToken : '';
    if (!refreshToken) {
      void recordServerFunctionMetric({ fnTotalCalls: 1 });
      throw new HttpsError('not-found', 'NO_DRIVE_REFRESH_TOKEN');
    }

    const now = Date.now();
    const cachedToken = typeof docData.cachedAccessToken === 'string' ? docData.cachedAccessToken : '';
    const cachedExpiresAtMs = typeof docData.cachedExpiresAtMs === 'number' ? docData.cachedExpiresAtMs : 0;
    const savedEmail = typeof docData.email === 'string' ? docData.email : '';

    // Reuse cached token if it still has > 6 minutes remaining and caller didn't request forced refresh
    if (!forceRefresh && cachedToken && cachedExpiresAtMs - now > 6 * 60 * 1000) {
      void recordServerFunctionMetric({ fnTotalCalls: 1, fnDriveCacheHits: 1 });
      return {
        accessToken: cachedToken,
        expiresAtMs: cachedExpiresAtMs,
        issuedAt: cachedExpiresAtMs - 3600 * 1000,
        email: savedEmail,
        fromCache: true,
      };
    }

    const clientId = GOOGLE_OAUTH_CLIENT_ID.value().trim();
    const clientSecret = GOOGLE_OAUTH_CLIENT_SECRET.value().trim();
    if (!clientId || !clientSecret) {
      throw new HttpsError('failed-precondition', 'Λείπουν τα Google OAuth credentials στον server.');
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      void recordServerFunctionMetric({ fnTotalCalls: 1 });
      if (tokenData.error === 'invalid_grant') {
        await db
          .collection('users')
          .doc(uid)
          .set(
            {
              driveOfflineLinked: false,
              updatedAt: new Date(now).toISOString(),
            },
            { merge: true }
          );
        throw new HttpsError('permission-denied', 'DRIVE_REFRESH_REVOKED');
      }
      throw new HttpsError(
        'unavailable',
        tokenData.error_description || tokenData.error || 'Αποτυχία ανανέωσης Google Drive token.'
      );
    }

    const expiresInSec = Number(tokenData.expires_in || 3599);
    const expiresAtMs = now + expiresInSec * 1000;

    await privateRef.set(
      {
        cachedAccessToken: tokenData.access_token,
        cachedExpiresAtMs: expiresAtMs,
        updatedAt: new Date(now).toISOString(),
      },
      { merge: true }
    );

    await db
      .collection('users')
      .doc(uid)
      .set(
        {
          driveOfflineLinked: true,
          ...(savedEmail ? { driveEmail: savedEmail } : {}),
          driveAccessTokenV3: tokenData.access_token,
          driveTokenIssuedAtV3: now,
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );

    void recordServerFunctionMetric({ fnTotalCalls: 1, fnDriveRefreshCalls: 1 });

    return {
      accessToken: tokenData.access_token,
      expiresAtMs,
      issuedAt: now,
      email: savedEmail,
      fromCache: false,
    };
  }
);

interface MonitoringPoint {
  interval?: { startTime?: string; endTime?: string };
  value?: { int64Value?: string; doubleValue?: number };
}

interface MonitoringResponse {
  timeSeries?: Array<{
    metric?: { labels?: Record<string, string> };
    resource?: { labels?: Record<string, string> };
    points?: MonitoringPoint[];
  }>;
}

async function queryDailyMonitoringSeries(
  accessToken: string,
  metricType: string,
  startIso: string,
  endIso: string,
  extraFilter?: string
): Promise<Record<string, number>> {
  const byDate: Record<string, number> = {};
  try {
    const filterExpr = extraFilter
      ? `metric.type="${metricType}" AND ${extraFilter}`
      : `metric.type="${metricType}"`;
    const url =
      `https://monitoring.googleapis.com/v3/projects/${PROJECT_ID}/timeSeries` +
      `?filter=${encodeURIComponent(filterExpr)}` +
      `&interval.startTime=${encodeURIComponent(startIso)}` +
      `&interval.endTime=${encodeURIComponent(endIso)}` +
      `&aggregation.alignmentPeriod=86400s` +
      `&aggregation.perSeriesAligner=ALIGN_SUM` +
      `&aggregation.crossSeriesReducer=REDUCE_SUM`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return byDate;
    const data = (await res.json()) as MonitoringResponse;
    for (const ts of data.timeSeries || []) {
      for (const pt of ts.points || []) {
        const day = pt.interval?.startTime?.slice(0, 10);
        if (!day) continue;
        const val = Number(pt.value?.int64Value ?? pt.value?.doubleValue ?? 0) || 0;
        byDate[day] = (byDate[day] || 0) + val;
      }
    }
  } catch {
    // ignore individual metric fetch failure
  }
  return byDate;
}

async function queryLatestGaugeSumBytes(
  accessToken: string,
  metricType: string,
  nowMs: number
): Promise<number> {
  try {
    const startIso = new Date(nowMs - 48 * 60 * 60 * 1000).toISOString();
    const endIso = new Date(nowMs).toISOString();
    const filterExpr = `metric.type="${metricType}"`;
    const url =
      `https://monitoring.googleapis.com/v3/projects/${PROJECT_ID}/timeSeries` +
      `?filter=${encodeURIComponent(filterExpr)}` +
      `&interval.startTime=${encodeURIComponent(startIso)}` +
      `&interval.endTime=${encodeURIComponent(endIso)}` +
      `&aggregation.alignmentPeriod=3600s` +
      `&aggregation.perSeriesAligner=ALIGN_MAX` +
      `&aggregation.crossSeriesReducer=REDUCE_SUM`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as MonitoringResponse;
    let latestTime = '';
    let latestVal = 0;
    for (const ts of data.timeSeries || []) {
      for (const pt of ts.points || []) {
        const t = pt.interval?.endTime || pt.interval?.startTime || '';
        const val = Number(pt.value?.int64Value ?? pt.value?.doubleValue ?? 0) || 0;
        if (t >= latestTime && val > 0) {
          latestTime = t;
          latestVal = val;
        }
      }
    }
    return Math.round(latestVal);
  } catch {
    return 0;
  }
}

async function queryDailyGeminiApiSeries(
  accessToken: string,
  startIso: string,
  endIso: string
): Promise<{ okByDate: Record<string, number>; errByDate: Record<string, number> }> {
  const okByDate: Record<string, number> = {};
  const errByDate: Record<string, number> = {};
  try {
    const filterExpr =
      'metric.type="serviceruntime.googleapis.com/api/request_count" AND resource.labels.service="generativelanguage.googleapis.com"';
    const url =
      `https://monitoring.googleapis.com/v3/projects/${PROJECT_ID}/timeSeries` +
      `?filter=${encodeURIComponent(filterExpr)}` +
      `&interval.startTime=${encodeURIComponent(startIso)}` +
      `&interval.endTime=${encodeURIComponent(endIso)}` +
      `&aggregation.alignmentPeriod=86400s` +
      `&aggregation.perSeriesAligner=ALIGN_SUM`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { okByDate, errByDate };
    const data = (await res.json()) as MonitoringResponse;
    for (const ts of data.timeSeries || []) {
      const method = ts.resource?.labels?.method || '';
      if (!method.includes('GenerateContent') && !method.includes('Generate')) continue;
      const codeClass = ts.metric?.labels?.response_code_class || '';
      for (const pt of ts.points || []) {
        const day = pt.interval?.startTime?.slice(0, 10);
        if (!day) continue;
        const val = Number(pt.value?.int64Value ?? pt.value?.doubleValue ?? 0) || 0;
        if (codeClass === '2xx') {
          okByDate[day] = (okByDate[day] || 0) + val;
        } else {
          errByDate[day] = (errByDate[day] || 0) + val;
        }
      }
    }
  } catch {
    // ignore
  }
  return { okByDate, errByDate };
}

let cachedAdminUsagePayload: { expiresAt: number; data: unknown } | null = null;

/**
 * Admin-only live Firebase & Google Cloud Monitoring telemetry + exact EUR cost calculator.
 * Pulls exact daily & monthly Firestore Reads/Writes/Deletes, Cloud Functions requests,
 * Firebase Hosting bandwidth, Silent Drive token refreshes, and Gemini AI calls.
 */
export const getAdminFirebaseUsageStats = onCall(
  {
    region: 'europe-west1',
    cors: ALLOWED_CORS_ORIGINS,
    maxInstances: 2,
  },
  async (request) => {
    const uid = request.auth?.uid;
    const callerEmail =
      typeof request.auth?.token?.email === 'string' ? request.auth.token.email.toLowerCase() : '';
    if (!uid || callerEmail !== ADMIN_EMAIL) {
      throw new HttpsError('permission-denied', 'Πρόσβαση μόνο για τον διαχειριστή.');
    }

    const forceRefresh = Boolean(request.data?.forceRefresh);
    const nowMs = Date.now();
    if (!forceRefresh && cachedAdminUsagePayload && cachedAdminUsagePayload.expiresAt > nowMs) {
      return cachedAdminUsagePayload.data;
    }

    void recordServerFunctionMetric({ fnTotalCalls: 1, fnAdminStatsCalls: 1 });

    const now = new Date();
    // Query last 62 days aligned cleanly to UTC midnight boundaries
    const endMidnightTomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
    );
    const start62d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 61, 0, 0, 0)
    );
    const startIso = start62d.toISOString();
    const endIso = endMidnightTomorrow.toISOString();

    const [saToken, fnDailySnap, trafficSnap, drivePrivSnap] = await Promise.all([
      getRuntimeServiceAccountToken(),
      db.collection('firebase_usage_daily').orderBy('date', 'desc').limit(65).get(),
      db.collection('daily_traffic').orderBy('date', 'desc').limit(65).get(),
      db.collection('drivePrivateTokens').doc(uid).get(),
    ]);

    let monitoringAvailable = false;
    let readsByDate: Record<string, number> = {};
    let writesByDate: Record<string, number> = {};
    let deletesByDate: Record<string, number> = {};
    let runReqByDate: Record<string, number> = {};
    let cfExecByDate: Record<string, number> = {};
    let hostingBytesByDate: Record<string, number> = {};
    let geminiApiOkByDate: Record<string, number> = {};
    let geminiApiErrByDate: Record<string, number> = {};

    let hostingStorageBytes = 0;
    if (saToken) {
      const [reads, writes, deletes, runReqs, cfExecs, hostBytes, geminiApi, hostStorageBytes] =
        await Promise.all([
          queryDailyMonitoringSeries(
            saToken,
            'firestore.googleapis.com/document/read_count',
            startIso,
            endIso
          ),
          queryDailyMonitoringSeries(
            saToken,
            'firestore.googleapis.com/document/write_count',
            startIso,
            endIso
          ),
          queryDailyMonitoringSeries(
            saToken,
            'firestore.googleapis.com/document/delete_count',
            startIso,
            endIso
          ),
          queryDailyMonitoringSeries(
            saToken,
            'run.googleapis.com/request_count',
            startIso,
            endIso
          ),
          queryDailyMonitoringSeries(
            saToken,
            'cloudfunctions.googleapis.com/function/execution_count',
            startIso,
            endIso
          ),
          queryDailyMonitoringSeries(
            saToken,
            'firebasehosting.googleapis.com/network/sent_bytes_count',
            startIso,
            endIso
          ),
          queryDailyGeminiApiSeries(saToken, startIso, endIso),
          queryLatestGaugeSumBytes(
            saToken,
            'firebasehosting.googleapis.com/storage/total_bytes',
            now.getTime()
          ),
        ]);
      readsByDate = reads;
      writesByDate = writes;
      deletesByDate = deletes;
      runReqByDate = runReqs;
      cfExecByDate = cfExecs;
      hostingBytesByDate = hostBytes;
      geminiApiOkByDate = geminiApi.okByDate;
      geminiApiErrByDate = geminiApi.errByDate;
      hostingStorageBytes = hostStorageBytes;
      monitoringAvailable =
        Object.keys(reads).length > 0 ||
        Object.keys(writes).length > 0 ||
        Object.keys(hostBytes).length > 0 ||
        Object.keys(runReqs).length > 0 ||
        Object.keys(geminiApi.okByDate).length > 0 ||
        hostStorageBytes > 0;
    }

    const fnCustomByDate: Record<
      string,
      {
        fnTotalCalls: number;
        fnDriveRefreshCalls: number;
        fnDriveCacheHits: number;
        fnDriveAuthExchanges: number;
        fnAdminStatsCalls: number;
      }
    > = {};
    fnDailySnap.forEach((docSnap) => {
      const d = docSnap.data() || {};
      const dateKey = (typeof d.date === 'string' && d.date) || docSnap.id;
      fnCustomByDate[dateKey] = {
        fnTotalCalls: Number(d.fnTotalCalls) || 0,
        fnDriveRefreshCalls: Number(d.fnDriveRefreshCalls) || 0,
        fnDriveCacheHits: Number(d.fnDriveCacheHits) || 0,
        fnDriveAuthExchanges: Number(d.fnDriveAuthExchanges) || 0,
        fnAdminStatsCalls: Number(d.fnAdminStatsCalls) || 0,
      };
    });

    const aiByDate: Record<string, { ocrTotal: number; visits: number }> = {};
    trafficSnap.forEach((docSnap) => {
      const d = docSnap.data() || {};
      const dateKey = (typeof d.date === 'string' && d.date) || docSnap.id;
      aiByDate[dateKey] = {
        ocrTotal: Number(d.ocrTotalCount) || 0,
        visits: Number(d.totalVisits) || 0,
      };
    });

    // Official Firebase Blaze Free Tier & Europe Pricing (converted at ~0.93 EUR/USD)
    const USD_TO_EUR = 0.93;
    const FREE_READS_PER_DAY = 50_000;
    const FREE_WRITES_PER_DAY = 20_000;
    const FREE_DELETES_PER_DAY = 20_000;
    const FREE_HOSTING_BYTES_PER_DAY = 360 * 1024 * 1024; // 360 MB/day (~10.8 GB/month)
    const FREE_FUNCTIONS_PER_MONTH = 2_000_000;
    const FREE_GEMINI_PER_DAY = 1_500;

    // Build complete sorted list of dates
    const allDatesSet = new Set<string>([
      getUtcDateString(now),
      ...Object.keys(readsByDate),
      ...Object.keys(writesByDate),
      ...Object.keys(deletesByDate),
      ...Object.keys(runReqByDate),
      ...Object.keys(cfExecByDate),
      ...Object.keys(hostingBytesByDate),
      ...Object.keys(geminiApiOkByDate),
      ...Object.keys(fnCustomByDate),
      ...Object.keys(aiByDate),
    ]);

    const sortedDatesAsc = Array.from(allDatesSet)
      .filter((dt) => /^\d{4}-\d{2}-\d{2}$/.test(dt) && dt >= startIso.slice(0, 10))
      .sort((a, b) => a.localeCompare(b));

    // Track cumulative monthly function invocations so the 2,000,000/month free tier is exact!
    const monthFnAccum: Record<string, number> = {};

    const dailyRowsAsc = sortedDatesAsc.map((date) => {
      const monthKey = date.slice(0, 7); // YYYY-MM
      const fsReads = Math.round(readsByDate[date] || 0);
      const fsWrites = Math.round(writesByDate[date] || 0);
      const fsDeletes = Math.round(deletesByDate[date] || 0);
      const monFn = Math.max(Math.round(runReqByDate[date] || 0), Math.round(cfExecByDate[date] || 0));
      const customFn = fnCustomByDate[date]?.fnTotalCalls || 0;
      const fnCalls = Math.max(monFn, customFn);
      const hostingBytes = Math.round(hostingBytesByDate[date] || 0);
      const geminiApiCalls = Math.round(geminiApiOkByDate[date] || 0);
      const geminiApiErrors = Math.round(geminiApiErrByDate[date] || 0);
      const geminiCalls = Math.max(geminiApiCalls, aiByDate[date]?.ocrTotal || 0);
      // Estimated Gemini Flash OCR cost on Blaze Paid Tier 1 (~800 input + ~150 output tokens ≈ $0.0005 / call ≈ 0.000465 EUR)
      const geminiEstCostEur = geminiApiCalls * 0.0005 * USD_TO_EUR;
      const visits = aiByDate[date]?.visits || 0;
      const driveRefreshes = fnCustomByDate[date]?.fnDriveRefreshCalls || 0;
      const driveCacheHits = fnCustomByDate[date]?.fnDriveCacheHits || 0;
      const driveLinks = fnCustomByDate[date]?.fnDriveAuthExchanges || 0;

      const prevMonthFn = monthFnAccum[monthKey] || 0;
      const nextMonthFn = prevMonthFn + fnCalls;
      monthFnAccum[monthKey] = nextMonthFn;

      const billableReads = Math.max(0, fsReads - FREE_READS_PER_DAY);
      const billableWrites = Math.max(0, fsWrites - FREE_WRITES_PER_DAY);
      const billableDeletes = Math.max(0, fsDeletes - FREE_DELETES_PER_DAY);
      const billableHostingBytes = Math.max(0, hostingBytes - FREE_HOSTING_BYTES_PER_DAY);
      const billableFnToday = Math.max(
        0,
        nextMonthFn - Math.max(FREE_FUNCTIONS_PER_MONTH, prevMonthFn)
      );

      // Official Blaze overage rates:
      // Reads: $0.06 / 100k | Writes: $0.18 / 100k | Deletes: $0.02 / 100k
      // Hosting: $0.15 / GB | Functions: $0.40 / 1M
      const costReadsEur = (billableReads / 100_000) * 0.06 * USD_TO_EUR;
      const costWritesEur = (billableWrites / 100_000) * 0.18 * USD_TO_EUR;
      const costDeletesEur = (billableDeletes / 100_000) * 0.02 * USD_TO_EUR;
      const costHostingEur = (billableHostingBytes / (1024 * 1024 * 1024)) * 0.15 * USD_TO_EUR;
      const costFnEur = (billableFnToday / 1_000_000) * 0.40 * USD_TO_EUR;
      const exactBillableCostEur =
        costReadsEur + costWritesEur + costDeletesEur + costHostingEur + costFnEur;

      // Theoretical value covered by Free Tier (so admin sees how much free quota saved!)
      const rawValueWithoutFreeTierEur =
        ((fsReads / 100_000) * 0.06 +
          (fsWrites / 100_000) * 0.18 +
          (fsDeletes / 100_000) * 0.02 +
          (hostingBytes / (1024 * 1024 * 1024)) * 0.15 +
          (fnCalls / 1_000_000) * 0.40) *
        USD_TO_EUR;

      return {
        date,
        month: monthKey,
        fsReads,
        fsWrites,
        fsDeletes,
        fnCalls,
        driveRefreshes,
        driveCacheHits,
        driveLinks,
        hostingBytes,
        geminiCalls,
        geminiApiCalls,
        geminiApiErrors,
        geminiEstCostEur: Number(geminiEstCostEur.toFixed(6)),
        visits,
        billableReads,
        billableWrites,
        billableDeletes,
        billableHostingBytes,
        billableFnToday,
        exactCostEur: Number(exactBillableCostEur.toFixed(6)),
        totalWithGeminiEstEur: Number((exactBillableCostEur + geminiEstCostEur).toFixed(6)),
        savedByFreeTierEur: Number(
          Math.max(0, rawValueWithoutFreeTierEur - exactBillableCostEur).toFixed(6)
        ),
      };
    });

    const daily = [...dailyRowsAsc].reverse(); // Newest day first

    // Group monthly summaries
    const monthlyMap: Record<
      string,
      {
        month: string;
        daysCount: number;
        fsReads: number;
        fsWrites: number;
        fsDeletes: number;
        fnCalls: number;
        driveRefreshes: number;
        driveCacheHits: number;
        hostingBytes: number;
        geminiCalls: number;
        geminiApiCalls: number;
        geminiApiErrors: number;
        geminiEstCostEur: number;
        exactCostEur: number;
        totalWithGeminiEstEur: number;
        savedByFreeTierEur: number;
      }
    > = {};

    for (const r of dailyRowsAsc) {
      if (!monthlyMap[r.month]) {
        monthlyMap[r.month] = {
          month: r.month,
          daysCount: 0,
          fsReads: 0,
          fsWrites: 0,
          fsDeletes: 0,
          fnCalls: 0,
          driveRefreshes: 0,
          driveCacheHits: 0,
          hostingBytes: 0,
          geminiCalls: 0,
          geminiApiCalls: 0,
          geminiApiErrors: 0,
          geminiEstCostEur: 0,
          exactCostEur: 0,
          totalWithGeminiEstEur: 0,
          savedByFreeTierEur: 0,
        };
      }
      const m = monthlyMap[r.month];
      m.daysCount += 1;
      m.fsReads += r.fsReads;
      m.fsWrites += r.fsWrites;
      m.fsDeletes += r.fsDeletes;
      m.fnCalls += r.fnCalls;
      m.driveRefreshes += r.driveRefreshes;
      m.driveCacheHits += r.driveCacheHits;
      m.hostingBytes += r.hostingBytes;
      m.geminiCalls += r.geminiCalls;
      m.geminiApiCalls += r.geminiApiCalls;
      m.geminiApiErrors += r.geminiApiErrors;
      m.geminiEstCostEur = Number((m.geminiEstCostEur + r.geminiEstCostEur).toFixed(6));
      m.exactCostEur = Number((m.exactCostEur + r.exactCostEur).toFixed(6));
      m.totalWithGeminiEstEur = Number((m.totalWithGeminiEstEur + r.totalWithGeminiEstEur).toFixed(6));
      m.savedByFreeTierEur = Number((m.savedByFreeTierEur + r.savedByFreeTierEur).toFixed(6));
    }

    const FREE_HOSTING_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB free tier total
    const billableHostingStorageBytes = Math.max(0, hostingStorageBytes - FREE_HOSTING_STORAGE_BYTES);
    const hostingStorageEstMonthlyCostEur = Number(
      ((billableHostingStorageBytes / (1024 * 1024 * 1024)) * 0.026 * USD_TO_EUR).toFixed(6)
    );

    const currentMonthKey = getUtcDateString(now).slice(0, 7);
    if (monthlyMap[currentMonthKey] && hostingStorageEstMonthlyCostEur > 0) {
      monthlyMap[currentMonthKey].exactCostEur = Number(
        (monthlyMap[currentMonthKey].exactCostEur + hostingStorageEstMonthlyCostEur).toFixed(6)
      );
      monthlyMap[currentMonthKey].totalWithGeminiEstEur = Number(
        (
          monthlyMap[currentMonthKey].totalWithGeminiEstEur + hostingStorageEstMonthlyCostEur
        ).toFixed(6)
      );
    }

    const monthly = Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));

    const privData = drivePrivSnap.exists ? drivePrivSnap.data() || {} : {};
    const driveOfflineStatus = {
      linked: Boolean(privData.refreshToken),
      email: typeof privData.email === 'string' ? privData.email : '',
      updatedAt: typeof privData.updatedAt === 'string' ? privData.updatedAt : '',
      tokenExpiresAtMs: typeof privData.cachedExpiresAtMs === 'number' ? privData.cachedExpiresAtMs : 0,
    };

    const resultPayload = {
      projectId: PROJECT_ID,
      fetchedAt: new Date().toISOString(),
      monitoringAvailable,
      hostingStorage: {
        totalBytes: hostingStorageBytes,
        freeLimitBytes: FREE_HOSTING_STORAGE_BYTES,
        billableBytes: billableHostingStorageBytes,
        estMonthlyCostEur: hostingStorageEstMonthlyCostEur,
      },
      quotas: {
        freeReadsPerDay: FREE_READS_PER_DAY,
        freeWritesPerDay: FREE_WRITES_PER_DAY,
        freeDeletesPerDay: FREE_DELETES_PER_DAY,
        freeHostingBytesPerDay: FREE_HOSTING_BYTES_PER_DAY,
        freeFunctionsPerMonth: FREE_FUNCTIONS_PER_MONTH,
        freeGeminiPerDay: FREE_GEMINI_PER_DAY,
        budgetAlertEur: 5,
      },
      driveOfflineStatus,
      todayDate: getUtcDateString(now),
      currentMonth: getUtcDateString(now).slice(0, 7),
      daily,
      monthly,
    };

    cachedAdminUsagePayload = {
      expiresAt: Date.now() + 60 * 1000,
      data: resultPayload,
    };

    return resultPayload;
  }
);
