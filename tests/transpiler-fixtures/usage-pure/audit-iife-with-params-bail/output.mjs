import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// IIFE whose param is a DESTRUCTURE pattern can't be statically arg-matched, so inline-call
// resolution bails and the live call survives. a single-Identifier identity param (`(x) => x`)
// IS inlined now - only non-trackable param shapes keep the receiver behind the call
const a = (({
  Map
}) => Map)(_WeakMap).has(1);
// fn-expression IIFE with an array-destructured param equally bails
const b = function ([Set]) {
  return Set;
}(_WeakSet).has(1);
export { a, b };