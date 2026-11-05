// Selecting literal containers retain all possible constructor values and native static reads.
// Each stored constructor carries the full surface required by its observed member.
const promises = { C: Promise };
const maps = { C: Map };
export const { C: { groupBy } } = flag ? promises : maps;
export const { C: { canParse } } = flag ? { C: Iterator } : other ? { C: URL } : user;
export const { C: { for: named } } = { C: Symbol };
