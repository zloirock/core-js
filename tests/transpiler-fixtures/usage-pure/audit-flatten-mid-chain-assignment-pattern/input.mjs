// Mid-chain `AssignmentPattern` default `{ Array: { from } = {} }` is transparent over proxy globals.
// `globalThis.Array` is always defined, so the default never fires and flatten emits a clean polyfill alias.
const { Array: { from } = {} } = globalThis;
const { Array: { of } = {} } = globalThis;
export { from, of };
