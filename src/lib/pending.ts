import { isPending, type Pending } from "../data/schema";

export interface Resolved<T> {
  /** Confirmed value, or the `porConfirmar` candidate when pending. */
  value: T | undefined;
  /** True when the field is not confirmed. */
  pending: boolean;
  /** Note explaining what is missing (only when pending). */
  note?: string;
}

/** Resolve a `Pending<T>` into a value plus its pending status. */
export function resolve<T>(v: Pending<T> | undefined): Resolved<T> {
  if (v === undefined) return { value: undefined, pending: true };
  if (isPending(v)) {
    return { value: v.porConfirmar as T | undefined, pending: true, note: v.nota };
  }
  return { value: v as T, pending: false };
}

/** Confirmed value only (undefined when pending). Never returns candidates. */
export function confirmed<T>(v: Pending<T> | undefined): T | undefined {
  return v === undefined || isPending(v) ? undefined : (v as T);
}

/** Replace `{token}` occurrences; unknown tokens are left untouched. */
export function fillTemplate(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{([^{}]*)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? (tokens[name] as string) : whole,
  );
}
