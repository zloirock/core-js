// an alias-write in an OPTIONAL call's argument short-circuits with a nullish receiver -
// the write may never run, so the member fold keeps the runtime guard instead of folding
// unconditionally (folding un-throws the native TypeError of the undefined alias)
let M;
declare const host: any;
host?.doThing({ Map: M } = globalThis);
export const viaOptionalArg = typeof M.groupBy;

let M2;
declare const a: any;
a?.b.c({ Map: M2 } = globalThis);
export const viaDeeperChain = typeof M2.groupBy;

// an unconditional sequence-position write still folds
let M3;
(0, ({ Map: M3 } = globalThis));
export const viaUnconditional = typeof M3.groupBy;
