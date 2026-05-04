// Nested destructure pattern `const { a: { from } } = wrapper` where `wrapper` is a
// const-bound ObjectExpression `{ a: Array }`. Detector walks the outer-prop chain
// collecting keys (`['a']`), then resolves the host receiver via static-object descent:
// dereference `wrapper` -> ObjectExpression, walk key 'a' -> Identifier 'Array' (the
// constructor leaf). Pair (Array, from) hits `KNOWN_STATIC_METHOD_RETURN_TYPES`, so
// `from('hi')` rewrites to `_Array$from('hi')` AND `arr` narrows to `Array<...>`.
// Both effects observable in the output - polyfill always wins, instance-method calls
// emit array-narrowed `_atMaybeArray` / `_includesMaybeArray`. Distinct methods per
// line so each receiver narrowing is visible
const wrapper = { a: Array };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.at(0);
arr.includes('h');
