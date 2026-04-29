// `(globalThis as any).Symbol.iterator in x` - outer `in` rewrite subsumes the chain. the
// `globalThis` leaf inside a TS as-cast wrapper must be marked as handled too; otherwise
// the identifier visitor re-fires on `globalThis` and emits a duplicate polyfill request
function check(x: unknown): boolean {
  return (globalThis as any).Symbol.iterator in x;
}
