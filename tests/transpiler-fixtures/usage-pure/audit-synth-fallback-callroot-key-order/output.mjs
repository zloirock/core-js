import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A retained effectful realm receiver keeps logical-default reads and source order.
// The ordinary static fallback control retains its synthesis.
function f({
  from
} = (() => (n++, _globalThis))()[eff(), 'self'].Array || _Set) {
  return from;
}
function g({
  of
} = (eff2(), {
  of: _Array$of
})) {
  return of;
}
export const r = [f(), g()];