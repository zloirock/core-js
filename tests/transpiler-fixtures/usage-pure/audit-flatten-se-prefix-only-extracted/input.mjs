// An unrelated sibling sequence runs exactly once beside a nested static declarator.
const { Array: { from } } = globalThis, y = (sideEffect(), 1);
export { from, y };
