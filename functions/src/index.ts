import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';

admin.initializeApp();
const db = admin.firestore();

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
 * Called ONCE when the user connects Google Drive (GoodNotes-style offline OAuth2 authorization code exchange).
 * Stores the long-lived `refresh_token` in server-only Firestore (`drivePrivateTokens/{uid}`)
 * so neither iPad nor Mac mini ever needs to open an OAuth popup window again.
 */
export const exchangeDriveAuthCode = onCall(
  {
    region: 'europe-west1',
    cors: ALLOWED_CORS_ORIGINS,
    secrets: [GOOGLE_OAUTH_CLIENT_SECRET],
    maxInstances: 10,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Απαιτείται σύνδεση χρήστη.');
    }

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
    maxInstances: 20,
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
      throw new HttpsError('not-found', 'NO_DRIVE_REFRESH_TOKEN');
    }

    const docData = snap.data() || {};
    const refreshToken = typeof docData.refreshToken === 'string' ? docData.refreshToken : '';
    if (!refreshToken) {
      throw new HttpsError('not-found', 'NO_DRIVE_REFRESH_TOKEN');
    }

    const now = Date.now();
    const cachedToken = typeof docData.cachedAccessToken === 'string' ? docData.cachedAccessToken : '';
    const cachedExpiresAtMs = typeof docData.cachedExpiresAtMs === 'number' ? docData.cachedExpiresAtMs : 0;
    const savedEmail = typeof docData.email === 'string' ? docData.email : '';

    // Reuse cached token if it still has > 6 minutes remaining and caller didn't request forced refresh
    if (!forceRefresh && cachedToken && cachedExpiresAtMs - now > 6 * 60 * 1000) {
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

    return {
      accessToken: tokenData.access_token,
      expiresAtMs,
      issuedAt: now,
      email: savedEmail,
      fromCache: false,
    };
  }
);
