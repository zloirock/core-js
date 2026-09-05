import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
// a SPREAD after the slot keeps the wrapper alive because no statement re-emits an iteration:
// a receiver-less static leaves a leaf sentinel, its prefix lifts, a write stays, a live sibling
// needs no sentinel; a reading claim on a re-readable element reads inline beside the residual,
// and one on an element that is not re-readable takes the positional slot instead of a ref and a
// husk; a spread BEFORE the slot leaves that slot to the positional pair too
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const f = () => [1];
const o = {
  b: [1]
};
eff('i');
const getPrototypeOf = _Object$getPrototypeOf;
const [{
  Object: {
    getPrototypeOf: _unused
  }
}] = [_globalThis, ...xs];
const freeze = _Object$freeze;
const [{
  Object: {
    freeze: _unused2
  }
}] = [kw = (eff('j'), _globalThis), ...xs];
const seal = _Object$seal;
const [{
  sibling
}] = [_globalThis, ...xs];
eff('k');
const isFrozen = _Object$isFrozen;
const [{
  isFrozen: _unused3
}] = [Object, ...xs];
const [{}] = [_globalThis.Array.prototype, ...xs];
const inlineSurface = _atMaybeArray(_globalThis.Array.prototype);
const [_ref] = [f(), ...xs];
const viaCall = _atMaybeArray(_ref);
const [_ref2] = [o.b, ...xs];
const viaMember = _atMaybeArray(_ref2);
const [, _ref3] = [...xs, _globalThis];
const behindSpread = _at(_ref3.Array.prototype);
const [, _ref4] = [...xs, [6, 7]];
// a leaf off a ctor the targets may lack re-anchors on the ponyfilled ctor as a declarator of its own,
// and the wrapper's husk keeps only the sentinel of a hop the realm always carries
const slotBehindSpread = _at(_ref4);
const {
  customZ
} = _AggregateError;
const anchoredBeside = _Object$keys;
const [{
  Object: {
    keys: _unused4
  }
}] = [_globalThis, ...xs];
export { getPrototypeOf, freeze, seal, sibling, isFrozen, inlineSurface, viaCall, viaMember, behindSpread, slotBehindSpread, customZ, anchoredBeside, seen, kw };