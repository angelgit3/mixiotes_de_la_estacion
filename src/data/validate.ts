import type { z } from "zod";
import { siteSchema, type SiteData } from "./schema";

type Issue = z.core.$ZodIssue;
type PathKey = string | number;

function valueAt(root: unknown, path: readonly PathKey[]): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<PathKey, unknown>)[key];
  }
  return node;
}

function formatPath(path: readonly PathKey[]): string {
  return path.reduce<string>((acc, key) => {
    if (typeof key === "number") return `${acc}[${key}]`;
    return acc ? `${acc}.${key}` : String(key);
  }, "") || "(raíz)";
}

function describeType(v: unknown): string {
  if (v === undefined) return "nada (falta el campo)";
  if (v === null) return "null";
  if (Array.isArray(v)) return "una lista";
  switch (typeof v) {
    case "string":
      return "un texto";
    case "number":
      return "un número";
    case "boolean":
      return "verdadero/falso";
    default:
      return "un objeto";
  }
}

const EXPECTED: Record<string, string> = {
  string: "un texto",
  number: "un número",
  boolean: "verdadero/falso",
  array: "una lista",
  object: "un objeto",
  int: "un número entero",
};

/** Expand one zod issue into zero or more `{ path, message }` bullets. */
function flatten(issue: Issue, root: unknown, base: PathKey[] = []): { path: PathKey[]; message: string }[] {
  const path = [...base, ...(issue.path as PathKey[])];

  if (issue.code === "invalid_union") {
    // Union of [confirmed, pending marker]: report the branch the author meant.
    const raw = valueAt(root, path);
    const looksPending = typeof raw === "object" && raw !== null && !Array.isArray(raw) && "pendiente" in raw;
    const branches = issue.errors as Issue[][];
    const branch = (looksPending ? branches[1] : branches[0]) ?? [];
    if (branch.length === 0) return [{ path, message: "valor no válido" }];
    return branch.flatMap((i) => flatten(i, root, path));
  }

  if (issue.code === "unrecognized_keys") {
    return issue.keys.map((k) => ({ path: [...path, k], message: "clave desconocida (¿error de escritura?)" }));
  }

  if (issue.code === "invalid_type") {
    const raw = valueAt(root, path);
    const expected = EXPECTED[issue.expected] ?? issue.expected;
    return [{ path, message: raw === undefined ? `falta este campo (se esperaba ${expected})` : `se esperaba ${expected}, pero hay ${describeType(raw)}` }];
  }

  if (issue.code === "invalid_value") {
    const options = issue.values.map((v) => JSON.stringify(v)).join(", ");
    return [{ path, message: `valor no permitido; opciones: ${options}` }];
  }

  if (issue.code === "too_small" || issue.code === "too_big") {
    const raw = valueAt(root, path);
    if (Array.isArray(raw) && issue.origin === "array") {
      const limit = String("minimum" in issue ? issue.minimum : issue.maximum);
      const bound = issue.code === "too_small" ? "mínimo" : "máximo";
      return [{ path, message: `la lista tiene ${raw.length} elemento(s); ${bound} ${limit}` }];
    }
  }

  return [{ path, message: issue.message }];
}

/**
 * Validate the raw sitio.json content. Returns typed data or throws an Error
 * with a human-readable (Spanish) message, one bullet per issue.
 */
export function parseSite(raw: unknown): SiteData {
  const result = siteSchema.safeParse(raw);
  if (result.success) return result.data;

  const estado =
    typeof raw === "object" && raw !== null && "estado" in raw ? String((raw as { estado: unknown }).estado) : "desconocido";
  const seen = new Set<string>();
  const bullets: string[] = [];
  for (const issue of result.error.issues) {
    for (const { path, message } of flatten(issue, raw)) {
      const line = `  • ${formatPath(path)} — ${message}`;
      if (!seen.has(line)) {
        seen.add(line);
        bullets.push(line);
      }
    }
  }
  throw new Error(`sitio.json no es válido (estado: ${estado}):\n${bullets.join("\n")}`);
}
