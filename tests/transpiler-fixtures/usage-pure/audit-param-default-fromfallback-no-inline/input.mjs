// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call.
// per-branch synth-swap turns each viable branch into its own `{key: _Branch$key}` literal:
// Array.from / Map.groupBy / Promise.try are static methods with viable pure entries;
// Set.from / WeakMap.* don't exist as static -> their branch stays raw, the constructor
// polyfill (`_Set`, `_WeakMap`) still substitutes via the standard global rewrite
function f({ from } = cond ? Array : Set) { return from; }
function g({ groupBy } = cond ? Map : WeakMap) { return groupBy; }
function h({ try: t } = pickPromise() ?? Promise) { return t; }
export { f, g, h };
