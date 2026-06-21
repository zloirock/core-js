import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// IIFE with params shadowing free identifiers in body - inline-call resolution must bail
// when the callee has params. body's `Map` could resolve to a param value, not the global,
// so resolution returns null. arrow with no params is the only inline-able form
const a = (Map => Map)(_WeakMap).has(1);
// fn-expression IIFE with params equally bails
const b = function (Set) {
  return Set;
}(_WeakSet).has(1);
export { a, b };