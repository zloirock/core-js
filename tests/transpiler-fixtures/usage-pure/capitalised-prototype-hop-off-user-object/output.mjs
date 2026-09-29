import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _globalThis from "@core-js/pure/actual/global-this";
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
({
  Model: {
    prototype: {
      at: last
    }
  },
  size
} = registry);
const slotted = {
  Model: {
    prototype: [3]
  }
};
const {
  slot: {
    Model: {
      prototype: {
        flat
      }
    }
  }
} = {
  slot: slotted
};
let filled, count;
({
  Model: {
    prototype: {
      fill: filled = null
    }
  },
  size: count
} = registry);
let stored, found;
for (const {
  Model: {
    prototype: {
      includes
    }
  }
} = stored = registry; !found;) found = includes;
export const copyWithin = _copyWithinMaybeArray(_globalThis.Array.prototype);
export { last, size, flat, filled, count, stored, found };