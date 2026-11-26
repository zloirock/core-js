import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
interface F {
  ys: number[];
}
// inherited interface members resolve through the extends chain
interface SubI extends F {
  tag: string;
}
function isSub(o: unknown): o is SubI {
  return true;
}
function gi(v: unknown) {
  if (isSub(v)) {
    var _ref, _ref2;
    _atMaybeArray(_ref = v.ys).call(_ref, 0);
    _toSortedMaybeArray(_ref2 = v.ys).call(_ref2);
  }
}