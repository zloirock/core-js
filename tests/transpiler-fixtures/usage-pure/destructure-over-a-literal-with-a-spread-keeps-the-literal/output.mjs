import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A selecting slot retains its literal so every spread effect finishes before the method read.
// A constant slot keeps its existing shared receiver rather than copying that literal.
const a = _atMaybeArray({
  ...spread,
  w: c ? [1] : [2]
}.w);
export { a };
const _ref = [1];
export const {
  v: {}
} = {
  ...other,
  v: _ref
};
export const b = _flatMaybeArray(_ref);