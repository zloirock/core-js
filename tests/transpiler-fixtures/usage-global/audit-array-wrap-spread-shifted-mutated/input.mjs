// a static MUTATED through a spread-shifted maybe-alias lives in its own fixture: the mutation
// pre-pass poisons the name file-wide, so mixing it into the pairing fixture would silently
// rewrite what the other rows lock. the maybe-pair still classifies M as the global Map, and the
// mutated-static canon routes the write through the injected constructor modules.
let tail = [{}, {}];
const [, { Map: M }] = [...tail, globalThis];
M.groupBy = patched;
export const viaMutatedThroughMaybe = M.groupBy([1, 2], v => v);
