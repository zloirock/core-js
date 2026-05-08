// `const Foo = Array; const wrapper = { a: Foo }` chains identifier hops before reaching the constructor.
// Static descent must follow each const hop until it lands on a literal object or unbound identifier.
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from(['x']);
arr.at(0);
arr.includes('x');
