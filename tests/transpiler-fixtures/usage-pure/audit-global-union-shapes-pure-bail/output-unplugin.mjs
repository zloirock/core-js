import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// pure twin of the usage-global union shapes: pure substitutes only when CERTAIN, so a
// reassigned alias / captured branching value / conditionally reassigned self-ref var all
// keep their reads RAW - the global-side union widening must never leak substitutions here
function f(c, d) {
  let M0 = Object;
  if (c) M0 = Array;
  let M = M0;
  if (d) M = _Map;
  M.from([1, 2, 3]);
}
f(true, false);

let loopHeld = Array;
for (const { z = (loopHeld = Object) } of []) { void z; }
export const y = loopHeld.of(1);

let src = _globalThis.cond ? _Iterator : _Set;
const captured = src;
src = {};
export const use = captured.isDisjointFrom;

var Promise = Promise;
if (_globalThis.cond) Promise = mock;
export const t = Promise.try;