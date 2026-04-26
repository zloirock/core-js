import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call.
// each viable branch becomes its own `{key: _Branch$key}` literal independently:
// `Array.from` / `Map.groupBy` / `Promise.try` resolve to their pure entries; `Set.from`
// / `WeakMap.*` are not static methods so those branches are left raw, with the
// constructors themselves still rewritten via the usual global path
function f({ from } = cond ? { from: _Array$from } : _Set) { return from; }
function g({ groupBy } = cond ? { groupBy: _Map$groupBy } : _WeakMap) { return groupBy; }
function h({ try: t } = pickPromise() ?? { try: _Promise$try }) { return t; }
export { f, g, h };