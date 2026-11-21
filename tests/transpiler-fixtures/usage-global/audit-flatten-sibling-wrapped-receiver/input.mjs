// The cast keeps the sibling receiver rooted at globalThis.
const { Array: { of } } = globalThis, cast = (globalThis as any)['Promise'];
export { of, cast };
