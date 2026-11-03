import _Map from "@core-js/pure/actual/map";
// A literal returned by a transparent IIFE keeps the assignment pattern.
// The substituted constructor must carry its static.
let groupBy;
({
  C: {
    groupBy
  }
} = (() => ({
  C: _Map
}))());
export const r = typeof groupBy;