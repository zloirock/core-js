import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// a nested slot read asks what a MEMBER read of that slot asks: the container is reachable through
// its binding, so a hold on it makes the narrow unsound and a MULTI-FAMILY method takes the generic
// dispatcher. the same source spelled flat answers the same - one answer per shape, either spelling
const held = {
  y: [1, [2]]
};
export function hold() {
  return held;
}
const nested = function () {
  const at = _at(held.y);
  return at;
}();
const flat = function () {
  const viaFlat = _at(held.y);
  return viaFlat;
}();
// ... and with nothing holding the container, both keep the narrow
const local = {
  y: [1, [2]]
};
const narrowed = function () {
  const viaLocal = _atMaybeArray(local.y);
  return viaLocal;
}();
// ... and the DESTRUCTURED BINDING asks it too: `const { y } = held` then `y.at(0)` reads the same
// slot the member spelling reads, so a holder unseats that narrow for both
const viaBinding = function () {
  const {
    y
  } = held;
  return _at(y).call(y, 0);
}();
export { nested, flat, narrowed, viaBinding };