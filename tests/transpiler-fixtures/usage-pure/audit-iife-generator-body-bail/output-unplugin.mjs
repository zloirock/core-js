import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// generator IIFE - `function*() { return Map; }()` returns Generator<never, Map>, not Map.
// inline-call resolution must reject generator callees so the call result isn't mis-typed as
// the wrapped value. parallel to async; both wrappers leave the receiver type unknown to the
// static type model
const a = (function*() {
  return _Map;
}()).has(1);
const b = (function*() {
  return _Set;
}()).intersection(new _Set([1]));
export { a, b };