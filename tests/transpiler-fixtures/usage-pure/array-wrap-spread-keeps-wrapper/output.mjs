import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Spreads retain native array iteration and static wrapper reads.
// Instance leaves before a spread use a known element; shifted leaves dispatch on the runtime element.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const f = () => [1];
const o = {
  b: [1]
};
const [{
  Object: {
    getPrototypeOf
  }
}] = [(eff('i'), _globalThis), ...xs];
const [{
  Object: {
    freeze
  }
}] = [kw = (eff('j'), _globalThis), ...xs];
const [{
  Object: {
    seal
  },
  sibling
}] = [_globalThis, ...xs];
const [{
  isFrozen
}] = [(eff('k'), Object), ...xs];
const [_ref] = [_globalThis.Array.prototype, ...xs];
const inlineSurface = _atMaybeArray(_ref);
const [_ref2] = [f(), ...xs];
const viaCall = _atMaybeArray(_ref2);
const [_ref3] = [o.b, ...xs];
const viaMember = _atMaybeArray(_ref3);
const [, _ref4] = [...xs, _globalThis];
const behindSpread = _at(_ref4.Array.prototype);
const [, _ref5] = [...xs, [6, 7]];
const slotBehindSpread = _at(_ref5);
// The array wrapper keeps both native constructor hops and its spread iteration.
const [{
  AggregateError: {
    customZ
  },
  Object: {
    keys: anchoredBeside
  }
}] = [_globalThis, ...xs];
export { getPrototypeOf, freeze, seal, sibling, isFrozen, inlineSurface, viaCall, viaMember, behindSpread, slotBehindSpread, customZ, anchoredBeside, seen, kw };