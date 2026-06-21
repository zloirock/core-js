// optional call on a proxy-global static method (`globalThis.Array.from?.()`). the static resolves
// to the same always-defined polyfill as the bare `Array.from?.()` (`_Array$from`), so the `?.`
// deoptimizes: the proxy-global chain must be recognized as the static like the bare identifier,
// else it falls into the generic optional-chain path and emits a guarded native `.from`.
export const a = globalThis.Array.from?.().at(0);
export const b = self.Array.of?.().flat();
export const c = globalThis.Array.from?.().findLast(x => x);
