// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
globalThis.Array.of = function patched() {
  return [7];
};
let m, q;
export const nestedAssign = (m = q = globalThis.window)?.self?.self.Array.of(1).flat?.();
