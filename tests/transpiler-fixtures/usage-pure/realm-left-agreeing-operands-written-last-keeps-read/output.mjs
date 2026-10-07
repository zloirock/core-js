import _globalThis from "@core-js/pure/actual/global-this";
// A bare last operand the source assigns no longer settles the selection for the static read: once the source
// writes `Map`, the reads over it are the user's, and the claim stays off whatever the operands name.
if (typeof Map === 'undefined') Map = MyMap;
export const viaWrittenLast = (_globalThis.Map ?? Map).groupBy([1, 2], x => x);