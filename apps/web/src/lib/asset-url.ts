function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\+/g, '/');
}

function normalizeUploadsPath(value: string): string {
  const normalized = normalizeSlashes(value)
    .replace(/\/uploads\/uploads\//gi, '/uploads/')
    .replace(/\/+/g, '/');

  if (normalized.startsWith('/uploads/')) {
    return normalized;
  }

  if (normalized.startsWith('uploads/')) {
    return `/${normalized}`;
  }

  if (normalized.startsWith('/products/')) {
    return `/uploads${normalized}`;
  }

  if (normalized.startsWith('products/')) {
    return `/uploads/${normalized}`;
  }

  return normalized;
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return normalizeBaseUrl(configuredUrl || '');
}

export function resolveAssetUrl(rawUrl?: string | null): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return undefined;
  }

  const apiBaseUrl = getApiBaseUrl();

  const normalizedRaw = normalizeSlashes(trimmed);

  if (normalizedRaw.startsWith('/')) {
    return `${apiBaseUrl}${normalizeUploadsPath(normalizedRaw)}`;
  }

  if (normalizedRaw.startsWith('uploads/') || normalizedRaw.startsWith('products/')) {
    return `${apiBaseUrl}${normalizeUploadsPath(normalizedRaw)}`;
  }

  if (/^https?:\/\//i.test(normalizedRaw)) {
    try {
      const parsedAssetUrl = new URL(normalizedRaw);
      const parsedPath = normalizeUploadsPath(parsedAssetUrl.pathname);

      // Any URL that points to local uploads should follow current API host/protocol.
      if (parsedPath.startsWith('/uploads/')) {
        const parsedApiUrl = new URL(apiBaseUrl);
        parsedAssetUrl.protocol = parsedApiUrl.protocol;
        parsedAssetUrl.host = parsedApiUrl.host;
      }

      parsedAssetUrl.pathname = parsedPath;
      return parsedAssetUrl.toString();
    } catch {
      return normalizedRaw;
    }
  }

  try {
    const parsed = new URL(normalizedRaw);
    parsed.pathname = normalizeUploadsPath(parsed.pathname);
    return parsed.toString();
  } catch {
    return normalizeUploadsPath(normalizedRaw);
  }
}
