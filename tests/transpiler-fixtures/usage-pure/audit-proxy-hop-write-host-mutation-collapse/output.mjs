import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A proxy-global hop in a NON-assignment mutation target - `delete`, update (`++`), a for-of/in head (the
// canonical `isMemberWriteHost`, not just `=`) - collapses the non-resolvable `window` hop to the pure root
// just like an assignment, else `_globalThis.window` is undefined off-engine (crash on the write). a SE-bearing
// hop key folds to its name + harvests the buried effect here too. distinct constructors per line.
let e = 0;
delete _globalThis.Set;
_globalThis.Map++;
for (_globalThis.WeakSet of [function () {}]) {}
delete (e++, _globalThis).WeakMap;