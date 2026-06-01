import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// split-emitted destructure init (`xs.flat(...)`) whose body-wrap arg hosts a NESTED split chain
// (`ys.flat(z).at(0)`): the outer split resolves by logical range, the body-wrap stays queued to
// compose, and the inner split + chain fold inside it - all three behaviors exercised at once
const includes = _includes(_flatMaybeArray(xs).call(xs, h(() => {
  var _ref;
  return _at(_ref = _flatMaybeArray(ys).call(ys, z)).call(_ref, 0);
})));
includes("x");