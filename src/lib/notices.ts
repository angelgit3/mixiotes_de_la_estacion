import type { Notice } from "../data/schema";

/**
 * Notices still relevant on `today` (YYYY-MM-DD): those whose `mostrarHasta`
 * (or `fecha` when absent) is today or later, sorted by `fecha`.
 */
export function activeNotices(list: readonly Notice[], today: string): Notice[] {
  return list
    .filter((n) => (n.mostrarHasta ?? n.fecha) >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
