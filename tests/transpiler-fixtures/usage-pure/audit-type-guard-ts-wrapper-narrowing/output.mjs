import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `instanceof` narrowing must peel through TS wrappers (`as`, `!`) on the LHS so the
// guard recognizes `x` as the variable being narrowed. without unwrapRuntimeExpr the guard
// fell back to general `_at` instead of array-specific `_atMaybeArray`
declare const x: unknown;
declare const y: unknown;
function f() {
  var _ref, _ref2;
  if (x as any instanceof Array) _atMaybeArray(_ref = x as any[]).call(_ref, 0);
  if (y! instanceof Array) _atMaybeArray(_ref2 = y as any[]).call(_ref2, 0);
}