// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = sealed[0].includes(1);
