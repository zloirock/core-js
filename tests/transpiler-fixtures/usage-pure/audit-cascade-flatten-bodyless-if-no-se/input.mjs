// A bodyless conditional retains its nested static assignment in the conditional body.
let from;
if (cond) ({ Array: { from } } = globalThis);
console.log(from);
