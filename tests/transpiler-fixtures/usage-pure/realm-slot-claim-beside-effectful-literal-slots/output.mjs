import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A literal whose slots run effects keeps them, in order, in the residual: the claim nested under its realm
// slot reads the realm afresh once they ran, and the sibling binds from the residual.
const {
    w: _ref
  } = {
    a: eff(),
    w: (hit(), _globalThis)
  },
  {
    Array: _ref2
  } = _ref;
const m = _atMaybeArray(_ref2.prototype),
  {
    x
  } = _ref;
export { m, x };