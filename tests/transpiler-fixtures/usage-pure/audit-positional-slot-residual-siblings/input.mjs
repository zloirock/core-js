// an array-wrapped claim one level down binds through a captured element: the residual re-emits the
// named siblings beside the claim - a numeric key included - in the place the source's nesting reads
// them, what stands before the hop before it and what stands after it after the inner level. a rest
// keeps its level native, a computed claim key keeps its own destructure, and an assignment host has
// no declaration for the residual to stand in.
const rows = Object.assign([1, [2]], { extra: 7 });
const holder = { y: rows, keep: 3 };
const pair = [holder];
const [{ y: { at, ...rest } }] = pair;
const [{ y: { flat, extra } }] = pair;
const [{ y: { concat }, keep }] = pair;
const [{ keep: leadKeep, y: { findLastIndex } }] = pair;
const [{ y: { findLast, extra: extra2, 0: first } }] = pair;
const [{ y: { [Symbol.iterator]: it, extra: extra3 } }] = pair;
let viaAssign, keptAssign;
([{ y: { includes: viaAssign, keep: keptAssign } }] = pair);
export { at, rest, flat, extra, concat, keep, leadKeep, findLastIndex, findLast, extra2, first, it, extra3, viaAssign, keptAssign };
