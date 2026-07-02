import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref;
// an instance-method memo in a for-of ITERABLE (loop header): `[1].flatMap(String)` needs a
// `_ref` receiver memo. the `_ref` binding must be declared BEFORE the loop, not unshifted into
// the loop body after its use in the header - babel's scope.push would otherwise land it there,
// declaring the temp after the iterable expression that already reads it
for (const x of _flatMapMaybeArray(_ref = [1]).call(_ref, String)) {
  x;
}