// a trailing comma the SOURCE wrote in an argument list leaves no trace in the AST, so the reprint
// prints the list without it on every route - the instance dispatch that rebuilds the list and the
// callee swap that keeps it alike - and the module parses on the ES5 baseline whatever the input
// spelled. a comma inside an argument is that argument's own
const a = [[1]];

export const instanceDispatch = a.flat(1,);
export const twoArgs = a.at(0,);
export const commaThenComment = a.flat(1, /* c */);
export const underNavGuard = globalThis.window?.Array.from([1],);
export const combinedSlots = a.flat?.(1,).at(0,);

// the callee-swap half: the list itself stays, only its comma goes
export const plainClaim = Array.from([1],);
export const constructed = new Map([[1, 2]],);

// a comma the argument itself contains is not the list's own
export const inString = ["x"].includes("a,",);
export const inRegex = ["x"].includes(/a,/.source,);

// NEGATIVE: the same lists without a source comma print the same
export const plain = a.flat(1);
export const zeroArity = a.flat(/* c */);
