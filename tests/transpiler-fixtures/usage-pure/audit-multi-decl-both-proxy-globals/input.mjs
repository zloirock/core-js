// Two nested static declarators in one declaration independently receive pure values.
// Neither rewrite consumes the sibling claim.
const { Array: { from } } = globalThis, { Object: { fromEntries } } = self;
export { from, fromEntries };
