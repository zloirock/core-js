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
// A spread keeps its array wrapper, and the iteration with it. A slot ahead of the spread is known:
// a static there is served by a literal in the slot, an instance leaf dispatches on the element the
// wrapper captured. A slot behind the spread may hold any element, so its hops read natively and its
// instance leaf takes the generic dispatch.
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
}] = [(eff('i'), {
  Object: {
    getPrototypeOf: _Object$getPrototypeOf
  }
}), ...xs];
const [{
  Object: {
    freeze
  }
}] = [(kw = (eff('j'), _globalThis), {
  Object: {
    freeze: _Object$freeze
  }
}), ...xs];
const [{
  Object: {
    seal
  },
  sibling
}] = [{
  Object: {
    seal: _Object$seal
  },
  sibling: _globalThis.sibling
}, ...xs];
const [{
  isFrozen
}] = [(eff('k'), {
  isFrozen: _Object$isFrozen
}), ...xs];
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
// a hop to a constructor the targets may lack takes its ponyfill in the slot's literal, so a leaf
// that is no static of it reads undefined there instead of throwing
const [{
  AggregateError: {
    customZ
  },
  Object: {
    keys: anchoredBeside
  }
}] = [{
  AggregateError: _AggregateError,
  Object: {
    keys: _Object$keys
  }
}, ...xs];
export { getPrototypeOf, freeze, seal, sibling, isFrozen, inlineSurface, viaCall, viaMember, behindSpread, slotBehindSpread, customZ, anchoredBeside, seen, kw };