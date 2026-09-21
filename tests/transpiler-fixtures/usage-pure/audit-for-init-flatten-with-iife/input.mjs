// A loop initializer keeps its static binding beside a function with a local receiver temporary.
let result = 0;
for (let { Array: { from } } = globalThis, kls = (() => { return [].values(); })(); result < 1; result++) {
  result = from([1]).length;
}
export { result };
