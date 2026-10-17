// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
globalThis.Array.of = function patched() {
  return [7];
};
// single-hop spelling of the same family (the previously locked canon holds)
let s;
export const singleHop = (s = globalThis.window)?.self.Array.of(1).flat?.();
