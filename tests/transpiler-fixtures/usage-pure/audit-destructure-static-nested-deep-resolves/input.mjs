// Two literal-object levels retain their native static read.
// The known Array.from result still narrows the later at, includes and copyWithin calls.
const wrapper = { a: { b: Array } };
const { a: { b: { from } } } = wrapper;
const arr = from('xy');
arr.at(0);
arr.includes('x');
arr.copyWithin(0, 1);
