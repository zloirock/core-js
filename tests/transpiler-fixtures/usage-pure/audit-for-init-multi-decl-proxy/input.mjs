// A loop header keeps the nested static and counter in one valid declaration.
let result = 0;
for (let { Array: { from } } = globalThis, i = 0; i < 1; i++) {
  result = from([1, 2]).length;
}
export { result };
