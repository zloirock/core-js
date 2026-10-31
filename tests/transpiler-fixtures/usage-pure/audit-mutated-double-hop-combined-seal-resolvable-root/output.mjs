import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
_globalThis.Array.of = function patched() {
  return [7];
};
// an always-defined root keeps the deopt even under the mutated landing: the raw read
// hangs off a defined object and cannot throw, so the dead guard stays dropped
let d;
export const resolvableRoot = _flatMaybeArray(_ref = (d = _globalThis, _self).Array.of(1))?.call(_ref);