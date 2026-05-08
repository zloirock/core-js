// chain of three const aliases of `Array` (A -> B -> C), then `from` destructured off
// the leaf. resolution must follow the alias chain so the call's return narrows to
// Array, and instance methods on the result emit array-specific dispatch
const A = Array;
const B = A;
const C = B;
const { from } = C;
const arr = from('hi');
arr.findLast(c => c);
arr.at(-1);
arr.includes('h');
