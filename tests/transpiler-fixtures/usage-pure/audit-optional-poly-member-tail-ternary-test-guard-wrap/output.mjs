import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// An optional polyfilled call with a non-optional member tail used as the TEST of a conditional
// expression must wrap the whole guarded chain (`(a?.at(-1).x) ? 1 : 2`), not leave it bare
// (`cond ? void 0 : X.x ? 1 : 2`, where the `? :` would bind to the success branch only and the
// null path would yield void 0 instead of the alternate). same trailing-tail tip handling as the
// operator case, applied to the ConditionalExpression-test position
export function pick(a, b) {
  var _ref, _ref2;
  const test = (a == null ? void 0 : _at(a).call(a, -1).x) ? 1 : 2;
  const combine = (b == null ? void 0 : _at(_ref = _mapMaybeArray(_ref2 = _flatMaybeArray(b).call(b)).call(_ref2, x => x)).call(_ref, -1).y) ? 3 : 4;
  return [test, combine];
}