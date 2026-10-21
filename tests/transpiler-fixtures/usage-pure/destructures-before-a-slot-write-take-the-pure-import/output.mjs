import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
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