import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a destructure that runs before every write of a global's slot sees the slot this build serves, through
// whichever channel renders it: a nested pattern under a realm hop, a selection with the global as an arm,
// a static under a constructor key off the realm, a rest beside one and a prototype pattern under one
const ns = {
  root: _globalThis
};
const M = _Map;
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