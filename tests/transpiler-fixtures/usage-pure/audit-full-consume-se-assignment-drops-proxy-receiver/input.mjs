// assignment-host form of the full-consume proxy-global drop: the dead `globalThis` receiver under
// a side-effecting SequenceExpression is dropped the same way as in the declaration host.
function eff() {}
let Set;
({ Set } = (eff(), globalThis));
export const s = new Set();
