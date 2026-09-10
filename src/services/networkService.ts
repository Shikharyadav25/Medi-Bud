let forceOfflineMode = false;

export function setForceOffline(enabled: boolean): void {
  forceOfflineMode = enabled;
}

export function isForceOffline(): boolean {
  return forceOfflineMode;
}

/**
 * Checks if device currently has active internet connectivity.
 * Falls back immediately to false if force-offline toggle is active
 * or if a 2-second ping fails.
 */
export async function checkNetworkOnline(): Promise<boolean> {
  if (forceOfflineMode) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Fast DNS/HTTP probe
    const res = await fetch("https://clients3.google.com/generate_204", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}
