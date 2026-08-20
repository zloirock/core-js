// `(globalThis as any).Symbol.iterator in x`: the TS as-cast wrapper must be unwrapped so the
// chain is recognised as a `globalThis` proxy and the iterator-protocol polyfill fires. usage-global
// keeps the `in` text verbatim, so the surviving `globalThis` leaf also earns `es.global-this`.
function check(x: unknown): boolean {
  return (globalThis as any).Symbol.iterator in x;
}
