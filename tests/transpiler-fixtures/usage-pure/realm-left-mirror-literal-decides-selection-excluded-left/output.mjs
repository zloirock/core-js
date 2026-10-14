import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A residual-keeping destructure rebuilds a realm-read LEFT as a literal: a left whose constructor entry is
// excluded (`Map`, while `groupBy` keeps its own) still decides its selection alone - the data subset carries
// `Map` - its right dead and its own effects in place, in a declaration and in a for-of head element alike; a
// caller default keeps the plain literal. A left the rebuild leaves possibly undefined, and a rebuilt RIGHT, keep
// the selection.
const {
  groupBy,
  deep: {
    a
  }
} = {
  groupBy: _Map$groupBy,
  deep: Map.deep
};
const {
  groupBy: grouped,
  deep: {
    b
  }
} = {
  groupBy: _Map$groupBy,
  deep: Map.deep
};
let byKey, c;
({
  groupBy: byKey,
  deep: {
    c
  }
} = (log(), {
  groupBy: _Map$groupBy,
  deep: Map.deep
}));
const {
  groupBy: byFlag,
  deep: {
    d
  }
} = (flag ? {
  groupBy: _Map$groupBy,
  deep: Map.deep
} : _globalThis.WeakRef) || Fallback;
const {
  groupBy: byRight,
  deep: {
    e
  }
} = _globalThis.WeakRef || {
  groupBy: _Map$groupBy,
  deep: Map.deep
};
export function pick({
  groupBy: picked,
  deep: {
    f
  }
} = {
  groupBy: _Map$groupBy,
  deep: Map.deep
}) {
  return [picked, f];
}
for (const {
  groupBy: perPass,
  deep: {
    g
  }
} of [{
  groupBy: _Map$groupBy,
  deep: Map.deep
}]) use(perPass, g);
export { groupBy, a, grouped, b, byKey, c, byFlag, d, byRight, e };