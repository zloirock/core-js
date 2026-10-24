import _Map from "@core-js/pure/actual/map/constructor";
// a qualified `namespace Map.Y {}` inside a function shadows global `Map` within that body - the
// runtime-binding scan reaches the leftmost segment in a nested scope too, so this `new Map()` is
// left raw. the outer-scope `new Map()` is NOT shadowed and stays polyfillable
function f() {
  // @ts-expect-error a namespace below the top level is the shape under test
  namespace Map.Y {
    export const z = 1;
  }
  // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
  return new Map();
}
const a = new _Map();
export { f, a };