// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const rows = Object.assign([1, [2]], { extra: 7 });
const holder = { y: rows, keep: 3 };
const pair = [holder];
const [{ y: { at, ...rest } }] = pair;
const [{ y: { flat, extra } }] = pair;
// ... and a sibling one level OUT reads the value ITS level reads, in the place the source's own
// nesting puts it: what stands before the hop is read before it, what stands after it after the
// inner level
const [{ y: { concat }, keep }] = pair;
const [{ keep: leadKeep, y: { findLastIndex } }] = pair;
// two named siblings beside the claim, one of them a NUMERIC key - the residual re-emits both
const [{ y: { findLast, extra: extra2, 0: first } }] = pair;
// NEGATIVE: a COMPUTED claim key is spelled by its own channel, so the residual cannot re-emit it -
// the shape keeps its own destructure
const [{ y: { [Symbol.iterator]: it, extra: extra3 } }] = pair;
// NEGATIVE: an ASSIGNMENT host binds no declaration, so the residual has nowhere to stand
let viaAssign, keptAssign;
([{ y: { at: viaAssign, keep: keptAssign } }] = pair);
export { at, rest, flat, extra, concat, keep, leadKeep, findLastIndex, findLast, extra2, first, it, extra3, viaAssign, keptAssign };
