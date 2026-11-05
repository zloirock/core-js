// A label preserves the unconditional placement of its declaration.
label: var { Map: M } = globalThis;
export const grouped = M.groupBy([1], value => value);
