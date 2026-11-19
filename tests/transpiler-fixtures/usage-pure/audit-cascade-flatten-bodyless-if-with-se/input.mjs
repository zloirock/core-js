// A bodyless assignment keeps its receiver effect and static binding under the same guard.
let from;
if (cond) ({ Array: { from } } = (logCall(), globalThis));
console.log(from);
