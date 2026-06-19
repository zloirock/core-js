import _Set from "@core-js/pure/actual/set/constructor";
// assignment-host form of the full-consume proxy-global drop: the dead `globalThis` receiver under
// a side-effecting SequenceExpression is dropped the same way as in the declaration host.
function eff() {}
let Set;
eff();
Set = _Set;
export const s = new Set();