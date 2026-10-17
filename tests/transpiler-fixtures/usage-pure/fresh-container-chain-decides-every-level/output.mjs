import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// in a `||` chain over fresh containers the first always yields: every later level is dead, and its
// constructor injects nothing, as in the chain over bare built-ins
export const {
  C: {
    groupBy
  }
} = {
  C: {
    groupBy: _Map$groupBy
  }
};
export const settled = _Promise$allSettled;