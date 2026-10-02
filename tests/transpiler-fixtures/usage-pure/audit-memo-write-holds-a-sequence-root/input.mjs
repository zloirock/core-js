// A dispatch memo retains the sequence receiver and its alias writes before the member read.
// Known constructors below that receiver use their pure imports; an unwritten key needs
// the constructor alone. The sequence write still dominates the sibling read.
let g, v, key;
export const seqRootMemo = (g = globalThis, v = globalThis.window?.self)?.Promise[key].at;
export const seqPrefixMemo = (log(), globalThis.window?.self)?.Promise[key].at;
export const aliasWrittenBeside = (g = globalThis, v = g.window?.self)?.Promise[key].at;
function log() {}
export { g, v };
