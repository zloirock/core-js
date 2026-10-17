import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// A capitalised hop down to `prototype` off the user's own object names no built-in instance surface:
// the routes that move or re-spell a surface read keep `registry.Model.prototype` where the source
// reads it, as they keep its lowercase spelling - beside a kept sibling, in a literal slot, under a
// default, in a stored loop head. Off the realm the surface route stands.
const registry = {
  get Model() {
    log('Model');
    return {
      prototype: [1, 2]
    };
  },
  get size() {
    log('size');
    return 1;
  }
};
let last, size;
last = _at(registry.Model.prototype);
({
  size
} = registry);
const slotted = {
  Model: {
    prototype: [3]
  }
};
const flat = _flatMaybeArray(slotted.Model.prototype);
let filled, count;
({
  Model: _ref
} = registry), {
  prototype: _ref2
} = _ref, filled = (_ref3 = _fillMaybeArray(_ref2)) === void 0 ? null : _ref3, {
  size: count
} = registry;
let stored, found;
for (const {
    Model: {
      prototype: _ref4
    }
  } = stored = registry, includes = _includesMaybeArray(_ref4); !found;) found = includes;
export const copyWithin = _copyWithinMaybeArray(_globalThis.Array.prototype);
export { last, size, flat, filled, count, stored, found };