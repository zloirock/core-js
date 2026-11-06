import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Static reads before later realm-slot writes keep their original source-time claims.
// A constructor inside a literal namespace stays native; later writes must not move ahead of those reads.
const ns = {
  root: _globalThis
};
const {
  root: {
    self: {
      Map: M
    }
  }
} = ns;
const {
  groupBy
} = shim || {
  groupBy: _Map$groupBy
};
const {
  Map: {
    groupBy: grouped
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
const allSettled = _Promise$allSettled;
const {
  Promise: _unused,
  ...others
} = _globalThis;
const {
  prototype: {
    has
  }
} = _WeakMap;
const {
  prototype: {
    finally: fin
  }
} = _Promise;
export { M, groupBy, grouped, allSettled, others, has, fin };
_globalThis.Map = MapShim;
_globalThis.WeakMap = WeakMapShim;
_globalThis.Promise = PromiseShim;