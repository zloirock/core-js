import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
interface F {
  ys: number[];
}
interface SubI extends F {
  tag: string;
}
function isSub(o: unknown): o is SubI {
  return true;
}
// composes with an && chain
function ga(v: unknown) {
  if (isSub(v) && v.tag) {
    var _ref, _ref2;
    _atMaybeArray(_ref = v.ys).call(_ref, 0);
    _withMaybeArray(_ref2 = v.ys).call(_ref2, 0, 2);
  }
}