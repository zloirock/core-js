// A const-bound literal wrapper retains its native Array.from read.
// The result type still selects array dispatch for at and includes.
const wrapper = { a: Array };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.at(0);
arr.includes('h');
