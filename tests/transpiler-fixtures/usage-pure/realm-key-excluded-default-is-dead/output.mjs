import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A realm key naming a built-in the build is told not to substitute still names it: the data subset carries
// `Iterator`, so the slot counts filled and the level's default is dead - it leaves, and the excluded static reads
// the raw slot (`from`). A key the filter keeps decides alike, its default leaving the mirror (`Map`).
const {
  from
} = _globalThis.Iterator;
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
export { from, groupBy };