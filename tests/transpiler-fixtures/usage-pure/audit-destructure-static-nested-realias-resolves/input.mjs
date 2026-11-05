// A constructor alias inside a literal wrapper retains its native static read.
// Following the alias still narrows the result's findLast and fill calls.
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.findLast(x => x);
arr.fill(0);
