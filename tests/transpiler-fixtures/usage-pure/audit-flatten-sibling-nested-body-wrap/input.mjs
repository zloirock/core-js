// Nested arrow bodies beside a static each retain their instance calls and local temporaries.
const { Array: { from } } = globalThis, sibling = () => [1].at(0) + ((() => [2].at(0))());
console.log(from, sibling());
