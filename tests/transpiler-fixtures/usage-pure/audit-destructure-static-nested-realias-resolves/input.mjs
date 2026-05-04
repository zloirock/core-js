// Re-aliased const chain: `const Foo = Array; const wrapper = { a: Foo };` then
// `const { a: { from } } = wrapper`. Walker dereferences each Identifier through its
// const VariableDeclarator init - `Foo` resolves to `Array` (one extra hop), then
// `wrapper.a` lands on `Foo` -> `Array`. Tests the re-alias chain at the leaf, not just
// at intermediate hops. Distinct methods (findLast, fill) lock narrowing
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.findLast(x => x);
arr.fill(0);
