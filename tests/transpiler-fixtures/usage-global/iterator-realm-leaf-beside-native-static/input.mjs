// A stable iterator leaf beside another realm field takes the same extraction in both hosts.
const { Map: { [Symbol.iterator]: iterator }, Object: { fromEntries } } = globalThis;
export { iterator, fromEntries };
