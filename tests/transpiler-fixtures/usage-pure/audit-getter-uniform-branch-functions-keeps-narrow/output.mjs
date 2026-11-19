import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Both getter branches return functions returning `number[]`. They are type-equal AND fold to the
// same invoke-return, so the commonType fold KEEPS the narrow: `.at` gets the array-specific
// polyfill. Contrast divergent branches (one array, one string), which fold to null (generic).
declare const cond: boolean;
class C {
  get f() {
    if (cond) return () => [1, 2, 3];
    return () => [4, 5, 6];
  }
}
_atMaybeArray(_ref = new C().f()).call(_ref, 0);