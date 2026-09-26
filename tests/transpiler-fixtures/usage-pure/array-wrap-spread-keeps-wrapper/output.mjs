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
// A spread preserves array iteration and the positions it can affect.
// Known static slots receive pure values while uncertain slots retain their native reads.
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