/**
 * Convex HTTP actions (getImage, downloadByStorageId) are served from *.convex.site.
 * Resume URLs saved from the admin often embed that origin; we prefer it over
 * VITE_CONVEX_SITE_URL so a mismatched env cannot point at the wrong deployment
 * (which yields 404 for storage.get).
 */

export function normalizeConvexSiteOrigin(url: string): string {
  return url.replace(/\/+$/, "");
}

export function resolveConvexSiteOrigin(resumeOrAssetUrl?: string): string | null {
  if (resumeOrAssetUrl) {
    try {
      const u = new URL(resumeOrAssetUrl);
      if (u.hostname.endsWith(".convex.site")) {
        return normalizeConvexSiteOrigin(u.origin);
      }
    } catch {
      // relative or invalid
    }
  }

  const envSite = import.meta.env.VITE_CONVEX_SITE_URL as string | undefined;
  if (envSite?.trim()) {
    return normalizeConvexSiteOrigin(envSite.trim());
  }

  const cloud = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (cloud?.includes(".convex.cloud")) {
    return normalizeConvexSiteOrigin(cloud.replace(".convex.cloud", ".convex.site"));
  }

  return null;
}

export function extractStorageId(url: string): string | null {
  try {
    return new URL(url).searchParams.get("storageId");
  } catch {
    return null;
  }
}

/**
 * Try URLs in order until one returns ok.
 * - Per-URL try/catch: network blocks and opaque failures surface as throws; we continue.
 * - Uses explicit CORS mode so behavior is predictable for cross-origin Convex *.site URLs.
 */
export async function fetchFirstOk(urls: string[]): Promise<Response> {
  let lastStatus: number | undefined;
  let lastNetworkError: Error | undefined;

  for (const u of urls) {
    try {
      const res = await fetch(u, { mode: "cors", credentials: "omit", cache: "no-store" });
      if (res.ok) return res;
      lastStatus = res.status;
    } catch (e) {
      lastNetworkError = e instanceof Error ? e : new Error(String(e));
    }
  }

  if (lastStatus !== undefined) {
    throw new Error(`HTTP ${lastStatus}`);
  }
  throw lastNetworkError ?? new Error("All fetch attempts failed");
}

export function buildResumeStorageFetchUrls(
  resumeUrl: string,
  storageId: string,
  downloadFilename: string
): string[] {
  const origin = resolveConvexSiteOrigin(resumeUrl);
  const sid = encodeURIComponent(storageId);
  const ordered: string[] = [];

  if (origin) {
    ordered.push(
      `${origin}/downloadByStorageId?storageId=${sid}&filename=${encodeURIComponent(downloadFilename)}`,
      `${origin}/getImage?storageId=${sid}`
    );
  }

  try {
    const u = new URL(resumeUrl);
    if (u.protocol === "http:" || u.protocol === "https:") {
      const canonical = u.href.split("#")[0];
      if (!ordered.includes(canonical)) ordered.push(canonical);
    }
  } catch {
    /* relative path — handled below */
  }

  if (!ordered.includes(resumeUrl)) {
    ordered.push(resumeUrl);
  }

  return [...new Set(ordered)];
}
