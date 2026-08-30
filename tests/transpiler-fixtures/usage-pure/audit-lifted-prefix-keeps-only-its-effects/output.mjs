import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a lifted prefix keeps exactly what can be observed: the statement it becomes discards every value,
// so an effect-free element is a comma the source wrote rather than work it did, and a prefix with
// nothing to observe leaves no statement at all. the trim is one canon for every channel that lifts
// one - the whole-prefix one a discarded receiver takes, and the per-element one the surviving
// residual, the nested flatten, the array wrapper and the bodyless slot print.
function eff() {}
function eff2() {}
let a, b, c, d, e;
a = _Map;
eff();
b = _Set;
eff();
c = _WeakMap;
eff(), eff2();
d = _WeakSet;
e = _Promise;
eff();
var f = _Map;
var {
  other
} = _globalThis;
eff();
var g = _Array$from;
eff();
const h = _Array$of;
if (1) {
  eff();
  var i = _Set;
  var {
    alsoOther
  } = _globalThis;
}
for (var j = (eff(), _WeakSet), {
    moreOther
  } = _globalThis, n = 0; n < 1; n++);
export const r = [a, b, c, d, e, f, other, g, h, i, alsoOther, j, moreOther];