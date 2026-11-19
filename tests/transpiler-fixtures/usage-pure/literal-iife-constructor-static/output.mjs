import _Map from "@core-js/pure/actual/map";
// A literal returned by a transparent IIFE keeps native destructuring.
// The substituted constructor must carry its static.
const {
  C: {
    groupBy
  }
} = (() => ({
  C: _Map
}))();
export const r = typeof groupBy;