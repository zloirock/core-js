// Tuple `[boolean, ...string[], number]` indexed past a middle rest has ambiguous element type.
// Element resolution must bail so dispatch falls back to the generic instance polyfill.
type MidRest = [boolean, ...string[], number];
declare const t: MidRest;
t[1].at(0);
