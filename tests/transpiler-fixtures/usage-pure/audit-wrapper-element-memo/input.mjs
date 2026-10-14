// an array wrapper whose element cannot be spelled twice: a sole claim reads the element inline, and a
// residual beside the claim (a default, a sibling key) keeps the element slot, so a memo gives that
// residual and the dispatch the ONE read the source performs. the memo hoists only where no later
// declarator carries effects of its own; a rest keeps the pattern native, its claim included.
const arr = [3, [1, 2]];
const hb = { get y() { return [3, [1, 2]]; } };
let out;
const [{ at: viaWrapOpaque }] = [arr.flat()];
const [{ findLast: viaWrapOpaqueDefault = null }] = [arr.flatMap(x => x)];
const [{ includes: viaWrapAheadOfPure }] = [arr.concat()], viaWrapPureTail = 1;
const [{ findLastIndex: viaKeptResidual, length: viaKeptLength }] = [hb.y], viaKeptTail = 1;
const [{ toSorted: viaSharedMemo, ...viaSharedRest }] = [hb.y.slice()];
// an assignment wrapper with a sequence prefix evaluates that prefix once, before its method read
let viaPeeledTail;
([{ toReversed: viaPeeledTail }] = [(out = 2, arr.toSpliced(0, 0))]);
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
