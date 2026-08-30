export function toJsonSafe(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toJsonSafe);

  if (value && typeof value === 'object') {
    const withJson = value as { toJSON?: () => unknown };
    if (typeof withJson.toJSON === 'function') {
      try {
        return toJsonSafe(withJson.toJSON());
      } catch {
        return String(value);
      }
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toJsonSafe(entry)]),
    );
  }

  return value;
}