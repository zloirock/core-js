import _Array$from from "@core-js/pure/actual/array/from";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Re-aliased const chain: `const Foo = Array; const wrapper = { a: Foo };` then
// `const { a: { from } } = wrapper`. Walker dereferences each Identifier through its
// const VariableDeclarator init - `Foo` resolves to `Array` (one extra hop), then
// `wrapper.a` lands on `Foo` -> `Array`. Tests the re-alias chain at the leaf, not just
// at intermediate hops. Distinct methods (findLast, fill) lock narrowing
const Foo = Array;
const wrapper = {
  a: Foo
};
const from = _Array$from;
const arr = from('hi');
_findLastMaybeArray(arr).call(arr, x => x);
_fillMaybeArray(arr).call(arr, 0);