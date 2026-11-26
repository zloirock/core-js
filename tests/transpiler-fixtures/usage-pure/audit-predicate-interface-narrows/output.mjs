import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
// a user predicate narrowing to a STRUCTURAL target feeds member-chain resolution
interface F {
  ys: number[];
}
function isF(o: unknown): o is F {
  return true;
}
function gp(v: unknown) {
  if (isF(v)) {
    var _ref, _ref2;
    _atMaybeArray(_ref = v.ys).call(_ref, 0);
    _findLastIndexMaybeArray(_ref2 = v.ys).call(_ref2, x => !!x);
  }
}