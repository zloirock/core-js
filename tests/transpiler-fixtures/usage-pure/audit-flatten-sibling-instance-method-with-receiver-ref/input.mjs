// A nested static shares its declaration with an arrow using a global receiver and an instance call.
// Both rewrites survive and the arrow owns its receiver temporary.
const { Array: { from } } = globalThis, val = () => [globalThis].values();
console.log(from, val());
