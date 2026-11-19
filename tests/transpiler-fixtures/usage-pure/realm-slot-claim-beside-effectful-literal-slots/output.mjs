import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A literal whose slots run effects keeps them, in order, in the residual: the claim nested under its realm
// slot reads the realm afresh once they ran, and the sibling binds from the residual.
const {
  w: {
    Array: {
      prototype: {
        at: _unused
      }
    },
    x
  }
} = {
  a: eff(),
  w: (hit(), _globalThis)
};
const m = _atMaybeArray(_globalThis.Array.prototype);
export { m, x };