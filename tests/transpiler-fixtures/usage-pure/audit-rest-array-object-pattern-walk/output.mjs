import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
// Rest param `...[a, { entries } = Map]` nests RestElement -> ArrayPattern -> AssignmentPattern -> ObjectPattern.
// All bindings must register as locals for shadow detection without triggering a spurious destructure polyfill.
function f(...[a, {
  entries
} = _Map]) {
  return [a, entries];
}
export { f };
export function shadow(...[a, {
  entries: Array
} = _Map]) {
  return Array.from(a);
}
export function unshadowed(...[a, {
  entries
} = _Map]) {
  return [_Array$from(a), entries];
}