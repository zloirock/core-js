// Static extractions off a rest parameter default require closed callers; key/default effects remain
// independent. A logical default whose left the build does not serve (`.Reflect`, its namespace entry
// excluded, while `ownKeys` keeps its own) takes the per-operand dispatch: the key effect and the collapsed
// hop stay on the left, the right swaps to its pure constructor, the static extracts into the body.
let eff = 0;
function k({ ownKeys, ...rest } = globalThis[(eff++, 'self')].Reflect || Set) { return [ownKeys, rest]; }
k();
