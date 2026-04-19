// rest via spread-call `fn(...arr)` — args[0] is SpreadElement whose type IS the array;
// unwrap once to the element type so T binds to string (not string[])
function fn<T>(...xs: T[]): T { return xs[0]; }
const arr: string[] = ['a', 'b'];
const s = fn(...arr);
s.at(0);
