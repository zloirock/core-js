import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a callee alias written BEFORE the call - in an earlier statement or earlier in the same sequence -
// holds the written function at the call: usage-global follows that dominating write to the static
// it yields (`es.array.from` off the rewritten `() => globalThis`), while the dead init resolves
// nothing. the dominance anchors at the callee's own read, so an in-sequence write counts as before
// it. usage-pure follows the same write on proof - the one unconditional write before the call

let mk = () => ({});
export const inSequence = (mk = () => _globalThis, _Array$from)('ab');
let mk2 = () => ({});
const G2 = (mk2 = () => _globalThis, mk2().Array);
export const capturedInSequence = _Array$of(1);
let mk3 = () => ({});
mk3 = () => _globalThis;
export const earlierStatement = _Object$fromEntries([]);

// NEGATIVE: the write yields no global - the dead init must not resolve either
let mk4 = () => _globalThis;
const G4 = (mk4 = () => ({}), mk4().Array);
export const deadInit = G4.fromAsync([]);