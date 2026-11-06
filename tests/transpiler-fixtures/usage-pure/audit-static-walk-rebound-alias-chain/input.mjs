// A constructor alias inside a literal wrapper keeps its native static read.
// Following that alias still narrows the result's array instance calls.
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from(['x']);
arr.at(0);
arr.includes('x');
