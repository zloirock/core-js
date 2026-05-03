// receiver type resolution must follow alias chain through polyfilled bindings.
// `const from = Array.from` (or destructured `const { from } = Array`) creates an alias
// to `Array.from`; resolver must recognise that the alias's call returns Array so that
// `arr.at` narrows to `_atMaybeArray` instead of falling to generic `_at`.
//
// `findLast` / `flat` "appear" to narrow even without proper resolution because they
// only exist on Array.prototype - polyfill registry has no `instance/find-last` /
// `instance/flat` generic variant, so the array-specific entry is the default. `at`
// exists on Array, TypedArray, and String, so registry HAS generic `instance/at` -
// without explicit array narrowing, resolver picks generic. lock array-specific narrow
// for all three methods through the alias chain
const from = Array.from;
const arr = from('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();
