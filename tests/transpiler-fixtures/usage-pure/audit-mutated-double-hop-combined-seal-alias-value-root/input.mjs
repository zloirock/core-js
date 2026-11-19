// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
globalThis.Array.of = function patched() {
  return [7];
};
// an ALIAS value resolves through the same family walk: the aliased `window` is exactly as
// undefinable as the spelled-out nav, so the guard survives here too
const w = globalThis.window;
let a;
export const aliasValueRoot = (a = w)?.self?.self.Array.of(1).flat?.();
