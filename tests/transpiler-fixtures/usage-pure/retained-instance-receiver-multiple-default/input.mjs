// Several instance leaves share the default receiver's single evaluation.
// The default runs only when the outer slot is undefined.
let calls = 0;
function make() { calls++; return [1, [2]]; }
const { A: { at, flat } = make() } = {};
console.log(at, flat, calls);
