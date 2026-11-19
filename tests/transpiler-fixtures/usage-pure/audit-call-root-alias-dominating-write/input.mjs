// a callee alias written BEFORE the call - in an earlier statement or earlier in the same sequence -
// holds the written function at the call: usage-global follows that dominating write to the static
// it yields (`es.array.from` off the rewritten `() => globalThis`), while the dead init resolves
// nothing. the dominance anchors at the callee's own read, so an in-sequence write counts as before
// it. usage-pure follows the same write on proof - the one unconditional write before the call

let mk = () => ({});
export const inSequence = (mk = () => globalThis, mk().Array).from('ab');

let mk2 = () => ({});
const G2 = (mk2 = () => globalThis, mk2().Array);
export const capturedInSequence = G2.of(1);

let mk3 = () => ({});
mk3 = () => globalThis;
export const earlierStatement = mk3().Object.fromEntries([]);

// NEGATIVE: the write yields no global - the dead init must not resolve either
let mk4 = () => globalThis;
const G4 = (mk4 = () => ({}), mk4().Array);
export const deadInit = G4.fromAsync([]);
