import { twMerge } from "tailwind-merge";

/** Join class names (falsy values ignored) and resolve Tailwind conflicts: the last one wins. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}
