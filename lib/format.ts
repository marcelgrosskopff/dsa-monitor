// Normalisation helpers (locked §9.6): dates render month+year (MM/YYYY); numbers in
// English convention (36,725). A single format layer so authored variance can't leak through.

/** Render an ISO date (or Date) to MM/YYYY. Passes through an already-MM/YYYY string. */
export function formatMonthYear(input: string | Date | undefined): string {
  if (!input) return "";
  if (typeof input === "string") {
    // Already MM/YYYY.
    if (/^\d{2}\/\d{4}$/.test(input)) return input;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return input;
    return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  }
  return `${String(input.getUTCMonth() + 1).padStart(2, "0")}/${input.getUTCFullYear()}`;
}

/** ISO date string from a Date, for ordering / sitemap / JSON-LD. */
export function toISODate(input: string | Date | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return typeof input === "string" ? input : "";
  return d.toISOString().slice(0, 10);
}

/** English-convention thousands separators on a numeric value. Leaves non-numeric strings
 *  (e.g. "11 min", "2 of 4", "62%") untouched. */
export function formatNumber(value: string | number): string {
  if (typeof value === "number") return value.toLocaleString("en-US");
  // Only reformat strings that are purely an integer/decimal.
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed).toLocaleString("en-US");
  }
  return value;
}

/** Human-readable file size from a byte count. */
export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const rounded = n >= 10 || i === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded} ${units[i]}`;
}

/** Derive an uppercase format glyph from a filename/extension/mime. */
export function formatFromAsset(
  extension?: string,
  override?: string
): string {
  if (override) return override.toUpperCase();
  if (extension) return extension.replace(/^\./, "").toUpperCase();
  return "PDF";
}
