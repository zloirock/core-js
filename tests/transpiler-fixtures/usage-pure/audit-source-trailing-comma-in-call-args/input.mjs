// a trailing comma the SOURCE wrote rides through untouched: this plugin lowers no syntax, and a
// list already spelled `f(1,)` means the target is not ES5 or a transpiler runs after us. dropping
// it would hold only where the argument text is re-spliced and not where the callee alone is
// swapped - one rule in two spellings. the AST renderer drops it when reprinting; hence the sidecar.
const a = [[1]];

export const instanceDispatch = a.flat(1,);
export const twoArgs = a.at(0,);
export const commaThenComment = a.flat(1, /* c */);
export const underNavGuard = globalThis.window?.Array.from([1],);
export const combinedSlots = a.flat?.(1,).at(0,);

// the callee-swap half: the argument bytes are never touched here
export const plainClaim = Array.from([1],);
export const constructed = new Map([[1, 2]],);

// a comma the argument itself contains is not the list's own
export const inString = ["x"].includes("a,",);
export const inRegex = ["x"].includes(/a,/.source,);

// NEGATIVE: no source comma, so the two emitters agree byte for byte on these
export const plain = a.flat(1);
export const zeroArity = a.flat(/* c */);
