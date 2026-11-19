import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// a destructure reading a realm KEY (`{ self: ... } = globalThis`) ahead of the realm's own install reads it once
// its receiver has evaluated - before the install - so the key is the realm and every level under it reads like
// its install-free twin: the level folds, a constructor, static, prototype or alias of it takes the pure import
const g = _globalThis;
const {
  Array: A
} = _globalThis;
const {
  self: {
    Set
  }
} = {
  self: {
    Set: _Set
  }
};
const {
  self: {
    Array: {
      from
    }
  }
} = {
  self: {
    Array: {
      from: _Array$from
    }
  }
};
const {
  self: {
    Map: {
      groupBy
    }
  }
} = {
  self: {
    Map: {
      groupBy: _Map$groupBy
    }
  }
};
const s = _self;
const at = _atMaybeArray(_globalThis.Array.prototype);
const includes = _includesMaybeArray(_globalThis.Array.prototype);
let B, flat;
({
  Array: B
} = _globalThis);
flat = _flatMaybeArray(_globalThis.Array.prototype);
for (const {
  self: {
    Promise: P
  }
} of [{
  self: {
    Promise: _Promise
  }
}]) sink(_Promise$resolve(1));
export { A, Set, from, groupBy, B, at, includes, flat };
export const fromAlias = _Array$of(1);
_globalThis.self = _globalThis;