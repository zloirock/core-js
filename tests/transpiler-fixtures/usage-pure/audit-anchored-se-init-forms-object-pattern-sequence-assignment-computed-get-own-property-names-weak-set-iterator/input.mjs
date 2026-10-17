// a symbol-iterator leaf in a buried host folds expression-shaped: the synth assign rides
// the discarded-value slot, reading the iterator method off the anchored constructor
let itF, outSF;
for (const { getOwnPropertyNames: gopn } = (({ WeakSet: { [Symbol.iterator]: itF } } = globalThis), Object); !outSF;) outSF = gopn;

export const r = [itF, outSF];
