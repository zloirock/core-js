// A compound write in the sequence prefix of a destructure init beside another declarator: the
// rewrite splits the declaration and lifts the prefix between the halves. A later read resolves
// the binding through that write where it now stands - the value it adds is unknown, and a
// logical assignment over a truthy array keeps the array.
let list = [1, 2];
const size = 1, { from: make } = (list += tail, Array);
export const found = list.includes('1');
let rows = [3, 4];
const count = 2, { of: build } = (rows ||= fallback, Array);
export const second = rows.at(1);
export const made = [make([5]), build(6), size, count];
