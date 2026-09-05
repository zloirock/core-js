import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// READING claims beside a neighbour: a built-in surface re-spells inline beside the residual a
// spread keeps (no memo hoists it ahead of the iteration), lifts its trailing neighbour and drops
// the wrapper where nothing else keeps it, an effectful computed key keeps its sentinel residual
// beside the memo, a leaf the hops merely reach by name stays native, and a re-readable element
// memoizes only where a BOUND neighbour keeps its residual
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const [{}] = [_globalThis, ...xs];
const viaSurface = _flatMaybeArray(_globalThis.Array.prototype);
eff('v');
const viaLifted = _atMaybeArray(_globalThis.Array.prototype);
const _ref = Array.prototype;
const [{
  [(eff('u'), 'at')]: _unused
}] = [_ref, ...xs];
const viaKey = _atMaybeArray(_ref);
const [{
  Array: {
    keys: nameMatch
  }
}] = [_globalThis, ...xs];
// a BOUND neighbour keeps the residual for its own sake, so the surface it re-reads memoizes even
// beside an effect; the effect alone keeps nothing, and the surface reads inline
const [{}, boundBeside] = [_globalThis.Array.prototype, eff('ad')];
const memoBeside = _atMaybeArray(_globalThis.Array.prototype);
eff('ae');
const inlineBesideEffect = _atMaybeArray(_globalThis.Array.prototype);
export { viaSurface, viaLifted, viaKey, nameMatch, memoBeside, boundBeside, inlineBesideEffect, seen };