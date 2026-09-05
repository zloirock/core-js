import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// a CAST narrows where it resolves and never blocks: what a leaf reads is the runtime VALUE, and an
// annotation is one more way to learn its type. a declared shape answers from the shape; `as any`
// names nothing, so the read answers from the value exactly as an uncast receiver does - a built-in
// surface narrows whichever spelling the hop key wears, and the spelled receiver keeps the cast
interface Box {
  y: number[];
}
const box = {
  y: [1, 2]
};
const widened = function () {
  const _ref = (box as any).y;
  const at = _atMaybeArray(_ref);
  const {
    other
  } = _ref;
  return [at, other];
}();
const declared = function () {
  const find = _findMaybeArray(box.y);
  return find;
}();
const surface = function () {
  const includes = _includesMaybeArray(_globalThis.Array.prototype);
  const map = _mapMaybeArray(_globalThis.Array.prototype);
  return [includes, map];
}();
export { widened, declared, surface };