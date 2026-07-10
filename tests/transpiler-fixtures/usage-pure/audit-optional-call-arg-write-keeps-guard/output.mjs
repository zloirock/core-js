import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an alias-write in an OPTIONAL call's argument short-circuits with a nullish receiver -
// the write may never run, so the member fold keeps the runtime guard instead of folding
// unconditionally (folding un-throws the native TypeError of the undefined alias)
let M;
declare const host: any;
host?.doThing({
  Map: M
} = _globalThis);
export const viaOptionalArg = typeof (M === _Map ? _Map$groupBy : M.groupBy);
let M2;
declare const a: any;
a?.b.c({
  Map: M2
} = _globalThis);
export const viaDeeperChain = typeof (M2 === _Map ? _Map$groupBy : M2.groupBy);

// an unconditional sequence-position write still folds
let M3;
0;
M3 = _Map;
export const viaUnconditional = typeof _Map$groupBy;