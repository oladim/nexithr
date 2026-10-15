// Is this auth result a REAL "you're signed out", or just a hiccup?
//
// supabase.auth.getUser() returns { user: null, error } both when there is no
// session and when Supabase couldn't be reached / a token refresh raced
// another tab or request. Treating the second case as "signed out" bounced
// signed-in users to /login ("you're already signed in") and made the 2FA
// gate think 2FA wasn't set up. Only these count as definitive:
//   - no error at all (simply no session)
//   - AuthSessionMissingError
//   - a 4xx auth API error (expired/invalid/revoked token), except 429
// Network errors, 5xx, rate limits and discarded refreshes are transient.
export function isTransientAuthError(error) {
  if (!error) return false;
  const name = error.name || error.constructor?.name || "";
  if (name === "AuthSessionMissingError") return false;
  if (name === "AuthRetryableFetchError" || name === "AuthRefreshDiscardedError") return true;
  const status = Number(error.status) || 0;
  if (status === 429 || status >= 500 || status === 0) return true;
  return false;
}

// Does the request/browser carry a Supabase auth cookie at all?
export function hasAuthCookie(cookies) {
  return (cookies || []).some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
}
