import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call.
// per-branch synth-swap turns each viable branch into its own `{key: _Branch$key}` literal:
// Array.from / Map.groupBy / Promise.try are static methods with viable pure entries;
// Set.from / WeakMap.* don't exist as static -> their branch stays raw, the constructor
// polyfill (`_Set`, `_WeakMap`) still substitutes via the standard global rewrite
function f({ from } = cond ? { from: _Array$from } : _Set) { return from; }
function g({ groupBy } = cond ? { groupBy: _Map$groupBy } : _WeakMap) { return groupBy; }
function h({ try: t } = pickPromise() ?? { try: _Promise$try }) { return t; }
export { f, g, h };