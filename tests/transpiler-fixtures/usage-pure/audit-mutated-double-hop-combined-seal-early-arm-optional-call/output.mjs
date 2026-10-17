import _globalThis from "@core-js/pure/actual/global-this";
// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
_globalThis.Array.of = function patched() {
  return [7];
};
let e;
export const earlyArmOptionalCall = (e = _globalThis.window)?.Array?.of(1);