import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _self from "@core-js/pure/actual/self";
// A realm alias the build has already respelled through its own realm import (`_globalThis`, `_self`) still
// names the realm: where the build serves the key's constructor the level's default is dead and leaves with its
// import, and the mirror spells the read in place exactly as it does over the realm itself, whichever binding
// reaches the alias first.
const realm = _globalThis;
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
const host = _self;
const {
  Promise: {
    allSettled
  }
} = {
  Promise: {
    allSettled: _Promise$allSettled
  }
};
export { groupBy, allSettled };