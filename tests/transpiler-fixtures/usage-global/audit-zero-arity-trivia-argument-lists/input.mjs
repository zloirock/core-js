// the global counterpart: trivia between the parens must not disturb DETECTION either. this flavor
// rewrites no call, so the separator question cannot arise here - what the import set proves is that
// a comment or a line break in place of an argument list still resolves each method to its module.
// one method per line, since a shared method would collapse into one import and mask its neighbour.
const arr = [[1]];
const str = 'abc';

export const flattened = arr.flat(/* depth */);
export const picked = arr.at(
);
export const found = arr.findLast(// predicate
);
export const padded = str.padStart(/* width */);
export const built = Array.from(/* source */);
export const mapped = new Map(/* entries */);
