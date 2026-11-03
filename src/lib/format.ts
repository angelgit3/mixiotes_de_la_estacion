/** "$85" for integers, "$85.50" otherwise (es-MX, MXN). */
export function formatPrice(n: number): string {
  const integer = Number.isInteger(n);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: integer ? 0 : 2,
    maximumFractionDigits: integer ? 0 : 2,
  }).format(n);
}

/** "08:00" -> "8:00". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}:${m}`;
}
