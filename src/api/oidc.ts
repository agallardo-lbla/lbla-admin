/**
 * OpenID Connect / OAuth 2.0 PKCE Client for LBLA ID
 * Implements RFC 7636 (PKCE with S256) and OpenID Connect Core 1.0.
 */

export interface OidcTokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  name?: string;
  roles: string[];
  persona_id: string | null;
  status: string;
}

const ISSUER = (import.meta.env.VITE_LBLA_ID_ISSUER || 'https://core.lbla.cl').replace(/\/$/, '');

export const OIDC_CONFIG = {
  issuer: ISSUER,
  clientId: 'lbla-admin-client',
  redirectUri: window.location.origin + '/oauth/callback',
  scopes: 'openid profile email read:personas write:personas read:academic write:academic read:asistencia write:asistencia',
  authorizeEndpoint: `${ISSUER}/oauth/authorize/`,
  tokenEndpoint: `${ISSUER}/oauth/token/`,
  userinfoEndpoint: `${ISSUER}/userinfo/`,
  revokeEndpoint: `${ISSUER}/oauth/revoke/`,
  logoutEndpoint: `${ISSUER}/oauth/logout/`,
};

/**
 * Generates a cryptographically random code verifier (RFC 7636).
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Calculates the S256 code challenge from a code verifier.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(array: Uint8Array): string {
  let str = '';
  for (let i = 0; i < array.byteLength; i++) {
    str += String.fromCharCode(array[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Initiates the OIDC Authorization Code Flow with PKCE.
 */
export async function initiateLogin(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateCodeVerifier().substring(0, 16);

  // Store verifier and state in sessionStorage temporarily for the callback
  sessionStorage.setItem('lbla_pkce_verifier', verifier);
  sessionStorage.setItem('lbla_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OIDC_CONFIG.clientId,
    redirect_uri: OIDC_CONFIG.redirectUri,
    scope: OIDC_CONFIG.scopes,
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${OIDC_CONFIG.authorizeEndpoint}?${params.toString()}`;
}

/**
 * Exchanges the authorization code and verifier for tokens.
 */
export async function exchangeCodeForTokens(code: string, returnedState: string): Promise<OidcTokens> {
  const savedState = sessionStorage.getItem('lbla_auth_state');
  const verifier = sessionStorage.getItem('lbla_pkce_verifier');

  if (!verifier) {
    throw new Error('PKCE verifier not found in session. Please initiate login again.');
  }

  if (savedState && savedState !== returnedState) {
    throw new Error('CSRF Warning: OAuth state mismatch.');
  }

  const response = await fetch(OIDC_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: OIDC_CONFIG.redirectUri,
      client_id: OIDC_CONFIG.clientId,
      code_verifier: verifier,
    }),
  });

  // Clear PKCE storage after use
  sessionStorage.removeItem('lbla_pkce_verifier');
  sessionStorage.removeItem('lbla_auth_state');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || errorData.error || 'Failed to exchange authorization code.');
  }

  return response.json();
}

/**
 * Refreshes an expired access token using the refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<OidcTokens> {
  const response = await fetch(OIDC_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: OIDC_CONFIG.clientId,
    }),
  });

  if (!response.ok) {
    throw new Error('Session expired. Re-authentication required.');
  }

  return response.json();
}

/**
 * Fetches user profile claims using the Bearer access token.
 */
export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await fetch(OIDC_CONFIG.userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load user profile from LBLA ID.');
  }

  return response.json();
}
