// nested-pattern write: reads `globalThis.constructor.Array`, not the global - stays native
function viaNested(items) {
  const { Array: A } = globalThis;
  outerUse(A.of(one, two));
  return function inner() {
    var A;
    var { constructor: { Array: A } } = globalThis;
    return A.fromAsync(items);
  };
}
export const results = [viaNested];
