import _Map from "@core-js/pure/actual/map";
// A literal IIFE used as a parameter default keeps native destructuring.
// The substituted constructor must carry its static.
function read({
  C: {
    groupBy
  }
} = (() => ({
  C: _Map
}))()) {
  return typeof groupBy;
}
export const r = read();