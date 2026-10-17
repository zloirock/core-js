import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Reading claims beside a neighbour: the RHS and its spread run before property dispatch.
// Stable names need no capture; member reads keep one. An effectful computed key retains
// its native sentinel, while a leaf reached only through named hops stays native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const [,] = [_globalThis, ...xs];
const viaSurface = _flatMaybeArray(_globalThis.Array.prototype);
const [,] = [_globalThis, eff('v')];
const viaLifted = _atMaybeArray(_globalThis.Array.prototype);
const [_ref] = [Array.prototype, ...xs];
const {
  [(eff('u'), 'at')]: _unused
} = _ref;
const viaKey = _atMaybeArray(_ref);
const [{
  Array: {
    keys: nameMatch
  }
}] = [_globalThis, ...xs];
// An effectful neighbour runs before the property read. Capture the original element
// whether that neighbour binds a value or is discarded.
const [_ref2, _ref3] = [_globalThis.Array.prototype, eff('ad')];
const memoBeside = _atMaybeArray(_ref2);
const boundBeside = _ref3;
const [_ref4] = [_globalThis.Array.prototype, eff('ae')];
const inlineBesideEffect = _atMaybeArray(_ref4);
export { viaSurface, viaLifted, viaKey, nameMatch, memoBeside, boundBeside, inlineBesideEffect, seen };