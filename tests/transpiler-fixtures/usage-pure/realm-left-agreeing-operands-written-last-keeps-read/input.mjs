// A bare last operand the source assigns no longer settles the selection for the static read: once the source
// may write `Map` - under a flag the build cannot answer - the reads over it are the user's, and the claim stays
// off whatever the operands name.
if (legacy) Map = MyMap;
export const viaWrittenLast = (globalThis.Map ?? Map).groupBy([1, 2], x => x);
