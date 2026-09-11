import _at from "@core-js/pure/actual/instance/at";
var _ref;
// the cross-return body fold drops the nullable return arm, but the call may still return
// null at runtime, so `??` may yield the string fallback: the fold survivor is marked and
// the truthy fold must not collapse to an array-Maybe (generic dispatch). plain JS - no
// annotations involved
function f(c) {
  if (!c) return null;
  return [1, 2];
}
_at(_ref = f(x) ?? 'fallback').call(_ref, 0);