import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// `_ref.x` references an undeclared global. both plugins' `isNameTaken` avoids
// allocating `_ref` initially. post-pass rename in babel's `pruneUnusedRefs`
// rebuilds `taken` only from declared bindings, not `program.references`, so
// an unused slot compaction may re-collide with the sloppy global
_globalThis._ref = {
  x: 5
};
console.log(_ref.x);
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);