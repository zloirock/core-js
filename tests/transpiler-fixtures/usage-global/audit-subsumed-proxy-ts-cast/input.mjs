// when the outer `in` rewrite already covers a `globalThis as any` chain, the inner
// `globalThis` must be marked handled so it does not double-emit.
function check(x: unknown): boolean {
  return (globalThis as any).Symbol.iterator in x;
}
