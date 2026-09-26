import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Reading claims beside a neighbour: a spread keeps its native wrapper, while a finite literal
// captures the element before dispatch. An effectful computed key retains its native sentinel;
// a leaf reached only through named hops stays native. Re-readable elements are captured when
// their neighbours would otherwise move ahead of the property read.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const [_ref] = [_globalThis, ...xs];
const viaSurface = _flatMaybeArray(_ref.Array.prototype);
const [_ref2] = [_globalThis, eff('v')];
const viaLifted = _atMaybeArray(_ref2.Array.prototype);
const [_ref3] = [Array.prototype, ...xs];
const {
  [(eff('u'), 'at')]: _unused
} = _ref3;
const viaKey = _atMaybeArray(_ref3);
const [{
  Array: {
    keys: nameMatch
  }
}] = [_globalThis, ...xs];
// An effectful neighbour runs before the property read. Capture the original element
// whether that neighbour binds a value or is discarded.
const [_ref4, _ref5] = [_globalThis.Array.prototype, eff('ad')];
const memoBeside = _atMaybeArray(_ref4);
const boundBeside = _ref5;
const [_ref6] = [_globalThis.Array.prototype, eff('ae')];
const inlineBesideEffect = _atMaybeArray(_ref6);
export { viaSurface, viaLifted, viaKey, nameMatch, memoBeside, boundBeside, inlineBesideEffect, seen };