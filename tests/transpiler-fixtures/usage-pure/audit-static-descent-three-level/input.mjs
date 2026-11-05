// Three literal-object levels preserve the native static from read.
// The result still narrows subsequent at, includes and copyWithin calls to array helpers.
const wrapper = { a: { b: { c: Array } } };
const { a: { b: { c: { from } } } } = wrapper;
const arr = from('xyz');
arr.at(0);
arr.includes('y');
arr.copyWithin(0, 1);
