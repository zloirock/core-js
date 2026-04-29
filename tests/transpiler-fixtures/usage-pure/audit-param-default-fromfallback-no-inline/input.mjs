// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call.
// each viable branch becomes its own `{key: _Branch$key}` literal independently:
// `Array.from` / `Map.groupBy` / `Promise.try` resolve to their pure entries; `Set.from`
// / `WeakMap.*` are not static methods so those branches are left raw, with the
// constructors themselves still rewritten via the usual global path
function f({ from } = cond ? Array : Set) { return from; }
function g({ groupBy } = cond ? Map : WeakMap) { return groupBy; }
function h({ try: t } = pickPromise() ?? Promise) { return t; }
export { f, g, h };
