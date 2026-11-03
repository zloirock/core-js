import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A fixed alias may expose a static through the ordinary shared capture.
// Its original literal IIFE is evaluated once, without replaying the initializer.
const held = (() => ({
  C: _Map
}))();
const {
  C: {
    groupBy
  }
} = {
  C: {
    groupBy: _Map$groupBy
  }
};
export const r = typeof groupBy;