// full-consume proxy-global destructure from a side-effecting SequenceExpression receiver: every
// outer binding resolves to a polyfillable global, so the receiver value is unused and the
// `globalThis` root is dropped while the SE prefix is lifted to preserve its effect. the dropped
// root must leak no dead `_globalThis` import and orphan no rewrite inside the rewritten statement.
function eff() {}
const { Map, WeakMap } = (eff(), globalThis);
export const a = new Map();
export const b = new WeakMap();
