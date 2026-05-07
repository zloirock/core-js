import _Array$of from "@core-js/pure/actual/array/of";
// multi-declarator where the first declarator is a plain Identifier binding (no pattern)
// and the second destructures `{ Array: { of } }` from `globalThis`. flattening the
// proxy-global destructure must not disturb the unrelated first binding
const of = _Array$of;
const x = 'simple';
export { x, of };