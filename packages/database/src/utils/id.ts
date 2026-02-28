/**
 * createId — Thin wrapper so the rest of the codebase doesn't
 * have a hard dependency on a specific ID library.
 *
 * Currently uses the native `crypto.randomUUID()` which is
 * available in Node.js 19+ and all modern runtimes.
 * Swap this implementation without touching any other file
 * if you move to nanoid or cuid2 later.
 */
export function createId(): string {
  return crypto.randomUUID()
}
