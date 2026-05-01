// Middle rest: `[boolean, ...string[], number]` — index 1 past middle rest is ambiguous.
// findTupleElement bails per line 1412; dispatch should pick generic _at via fallback.
type MidRest = [boolean, ...string[], number];
declare const t: MidRest;
t[1].at(0);
