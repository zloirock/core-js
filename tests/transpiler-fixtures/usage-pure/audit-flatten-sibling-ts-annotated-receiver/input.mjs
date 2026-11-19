// A flatten-shared destructure sibling in a TypeScript source: the TS-annotated preceding binding
// engages the typescript parser, exercising the flatten + sibling emit on the TS parse path
const arr: number[] = getArr();
const { Array: { from } } = globalThis, { at } = arr;
from([1]);
at(0);
