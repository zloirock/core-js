// a receiver that carries a CLAIM OF ITS OWN: the extraction spells that receiver, so the spelling
// has to be read LIVE - a copy captured when the job registered predates the inner step's own
// rewrite and ships the source read with its polyfill lost. every host that spells a receiver owes
// the same, which is why they are enumerated here rather than trusted to one route
const arr = [3, [1, 2]];
let out;
if (1) var { at: viaBodylessIf } = arr.flat();
do var { at: viaDoWhile } = arr.flat(); while (0);
for (var { at: viaForInit } = arr.flat(); !out;) out = viaForInit;
let viaWrapAssign;
([{ at: viaWrapAssign }] = [arr.flat()]);
const { at: viaDeclarator } = arr.flat();
let viaStatement;
({ at: viaStatement } = arr.flat());
// a DEFAULTED leaf spells its receiver like any other, so a claim INSIDE that receiver renders
// through it - the guard the default owes is around the dispatch, not a reason to drop the step
const { at: viaDefaultedLeaf = null } = arr.flat();
// ... and a BODYLESS slot hosts the multi-prop consume the statement slot does: its drain opens a
// block, and the memo, the extraction and the residual all go in there
let viaBodylessMulti, viaBodylessMultiLen;
if (1) ({ at: viaBodylessMulti, length: viaBodylessMultiLen } = arr.flat());
export { viaBodylessIf, viaDoWhile, viaForInit, viaWrapAssign, viaDeclarator, viaStatement, out };
export { viaDefaultedLeaf, viaBodylessMulti, viaBodylessMultiLen };
