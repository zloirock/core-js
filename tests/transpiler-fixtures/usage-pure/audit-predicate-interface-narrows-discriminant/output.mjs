import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
// a UNION target composes with a discriminant guard on the result
type W = {
  kind: 'a';
  xs: number[];
} | {
  kind: 'b';
  xs: string;
};
function isW(o: unknown): o is W {
  return true;
}
function gw(v: unknown) {
  if (isW(v) && v.kind === 'a') {
    var _ref, _ref2;
    _atMaybeArray(_ref = v.xs).call(_ref, 0);
    _fillMaybeArray(_ref2 = v.xs).call(_ref2, 0);
  }
}