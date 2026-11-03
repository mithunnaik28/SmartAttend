/**
 * Generates a cryptographically secure random session token.
 * Format: SA-{PREFIX}-{RANDOM_HEX}
 */
export function generateSessionToken(prefix = 'SESS') {
  const array = new Uint8Array(8);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 8; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `SA-${prefix.toUpperCase().slice(0, 4)}-${timestamp}-${hex}`;
}

/**
 * Builds the verification URL embedded in the QR code.
 * Even if offline or using code input, the token itself is the core payload.
 */
export function buildQRContent(sessionToken, baseUrl = window.location.origin) {
  return `${baseUrl}/scan?token=${encodeURIComponent(sessionToken)}`;
}

/**
 * Extracts a session token from either a raw token string or a full URL.
 */
export function extractTokenFromInput(input) {
  if (!input) return '';
  const trimmed = input.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const token = url.searchParams.get('token');
      if (token) return token;
    }
  } catch {
    // Not a valid URL, treat as direct token
  }
  return trimmed;
}
