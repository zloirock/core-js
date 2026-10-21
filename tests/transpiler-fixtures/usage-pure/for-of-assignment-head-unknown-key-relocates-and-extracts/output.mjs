import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A literal-wrapper loop head keeps its native static read and computed key.
// A direct realm head still relocates and extracts; its pre-existing sidecar
// differs only in the receiver used for the residual Math read.
let from, trunc, other;
const key = pick();
for ({
  w: {
    [key]: other,
    from
  }
} of [{
  w: Array
}]) break;
for (const _ref2 of [_globalThis]) {
  ({
    [key]: other
  } = _globalThis.Math);
  trunc = _Math$trunc;
  break;
}
export { from, trunc, other };