import _Set from "@core-js/pure/actual/set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call;
// runtime picks Array or Set, so a static inline-default would mis-bind one branch.
// `handleDestructuringPure` already filters via `if (meta.fromFallback) return`;
// `handleParameterDestructurePure` (function-param path) replicates the bail
function f({
  from
} = cond ? Array : _Set) {
  return from;
}
function g({
  groupBy
} = cond ? _Map : _WeakMap) {
  return groupBy;
}
function h({
  try: t
} = pickPromise() ?? _Promise) {
  return t;
}
export { f, g, h };