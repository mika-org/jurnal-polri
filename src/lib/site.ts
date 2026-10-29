/**
 * Helper utilities for canonical site URL and Open Graph metadata resolution
 */

export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL;

  // In production or if env is set to non-localhost, prefer explicit configured URL
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/+$/, "");
  }

  // Live production default
  if (process.env.NODE_ENV === "production") {
    return "https://jurnal-polri.elevore.web.id";
  }

  return envUrl ? envUrl.replace(/\/+$/, "") : "http://localhost:3000";
}

export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) {
    return `${getSiteUrl()}/images/logo-banner.png`;
  }
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${cleanPath}`;
}

export function getOgImageUrl(slugOrUrl?: string | null): string {
  const siteUrl = getSiteUrl();
  if (!slugOrUrl) {
    return `${siteUrl}/api/og-image`;
  }
  if (slugOrUrl.startsWith("/") || slugOrUrl.startsWith("http")) {
    return `${siteUrl}/api/og-image?url=${encodeURIComponent(slugOrUrl)}`;
  }
  return `${siteUrl}/api/og-image?slug=${encodeURIComponent(slugOrUrl)}`;
}
