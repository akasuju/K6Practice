
import http from 'k6/http';
import { check, sleep } from 'k6';

// ---- ENV VARS (set via CLI or your runner) ----
// Keycloak
const KC_BASE   = __ENV.KC_BASE   || 'https://testing-keycloak.waterflow.technology';
const REALM     = __ENV.KC_REALM  || 'naasa';
const CLIENT_ID = __ENV.KC_CLIENT_ID || 'tradeflow';
const CLIENT_SECRET = __ENV.KC_CLIENT_SECRET || ''; // set if client is confidential
const USERNAME  = __ENV.USERNAME || '';         // e.g., "yyy"
const PASSWORD  = __ENV.PASSWORD || '';         // e.g., "xxx"
const SCOPE     = __ENV.KC_SCOPE    || 'openid profile';

// Target (protected) API you want to load test after auth:
// Replace with your actual endpoint(s). Example below:
const TARGET_URL = __ENV.TARGET_URL ||
  'https://testing-tradeflow.waterflowtechnology.net/api/some/protected/resource';

// ---- Helper: obtain token via Password grant ----
function getAccessTokenPasswordGrant() {
  const tokenUrl = `${KC_BASE}/realms/${REALM}/protocol/openid-connect/token`;

  // NOTE: Keycloak expects x-www-form-urlencoded payload for token endpoint
  const payload = {
    grant_type: 'password',
    client_id: CLIENT_ID,
    username: USERNAME,
    password: PASSWORD,
    scope: SCOPE,
  };
  if (CLIENT_SECRET) payload.client_secret = CLIENT_SECRET;

  const res = http.post(tokenUrl, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    redirects: 0, // token endpoint should not redirect
  });

  check(res, {
    'token status 200': r => r.status === 200,
    'has access_token': r => !!r.json('access_token'),
  });

  if (res.status !== 200) {
    throw new Error(`Token request failed: ${res.status} ${res.body}`);
  }

  const json = res.json();
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
  };
}

// ---- k6 lifecycle ----
export function setup() {
  if (!USERNAME || !PASSWORD) {
    throw new Error('USERNAME/PASSWORD are required for Password grant.');
  }
  const tokens = getAccessTokenPasswordGrant();
  return { tokens };
}

export default function (data) {
  // Use the Bearer token in your requests
  const headers = {
    Authorization: `Bearer ${data.tokens.accessToken}`,
  };

  const res = http.get(TARGET_URL, { headers });

  check(res, {
    'API status is 200': r => r.status === 200,
  });

  // Add sleeps or think-time if needed
  sleep(1);
}

// ---- optional teardown ----
export function teardown(data) {
  // You can invoke logout if desired (requires refresh_token + client credentials).
  // For pure API load tests, usually not needed.
}
``
