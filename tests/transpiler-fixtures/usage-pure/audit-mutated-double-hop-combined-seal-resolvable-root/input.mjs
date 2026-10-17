// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
globalThis.Array.of = function patched() {
  return [7];
};
// an always-defined root keeps the deopt even under the mutated landing: the raw read
// hangs off a defined object and cannot throw, so the dead guard stays dropped
let d;
export const resolvableRoot = (d = globalThis)?.self?.self.Array.of(1).flat?.();
