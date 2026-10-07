// A selection whose LEFT holds a mirrored leaf gives way to that left: the literal is always defined,
// so the right is dead and drops even where an effect keeps the selection from collapsing whole - in an
// arm of a conditional default, in a container slot, beside an effect in the right. A left that may be
// falsy keeps its right live and mirrored, a name a pattern binds to `null` included.
let n = 0;
const [held] = [null];
function arm(o) { const { A: { from } = c ? (Iterator || Uint8Array) : WeakSet } = o; return from; }
const { B: { groupBy } } = { B: c ? Object : (Map || Set) };
function effectInRight(o) { const { C: { withResolvers } = Promise || (n++, WeakMap) } = o; return withResolvers; }
function liveRight(o) { const { D: { fromEntries } = maybe || Object } = o; return fromEntries; }
function heldLeft(o) { const { E: { of } = held || Array } = o; return of; }
export { arm, groupBy, effectInRight, liveRight, heldLeft, n };
