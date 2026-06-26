import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A TS-cast-wrapped constructor mutation LHS through a proxy hop: the canonical write-host check climbs the
// cast wrapper, so the proxy hop collapses to the pure root instead of the LHS member whole-swapping to the
// imported `_Set` const (which would reassign a frozen import in strict ESM). a SE-key hop folds to its name +
// harvests the buried effect through the cast. distinct constructors per line.
let e = 0;
(_globalThis.Set as any) = function () {};
(_self.Map as any) = function () {};
((e++, _globalThis).WeakSet as any) = function () {};