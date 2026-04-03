export const RESERVED_CREATOR_PATHS = [
  "about",
  "contact",
  "creator",
  "explore",
  "how-it-works",
  "creators",
  "faq",
  "dashboard",
  "admin",
  "login",
  "signup",
  "onboarding",
  "settings",
  "privacy",
  "terms",
  "refunds",
] as const;

export function isReservedCreatorPath(segment?: string | null) {
  if (!segment) return false;
  return RESERVED_CREATOR_PATHS.includes(segment.trim().toLowerCase() as (typeof RESERVED_CREATOR_PATHS)[number]);
}

export function buildCreatorPath(username?: string | null) {
  const trimmedUsername = username?.trim();
  if (!trimmedUsername) return "/explore";
  return `/creator/${encodeURIComponent(trimmedUsername)}`;
}

export function buildCreatorSeriesPath(username?: string | null, seriesId?: string | null) {
  const trimmedUsername = username?.trim();
  if (!trimmedUsername || !seriesId) return "/explore";
  return `/creator/${encodeURIComponent(trimmedUsername)}/series/${seriesId}`;
}
