// STACKED unresolvable hops under an SE key: the guard tests the probe alone (`_globalThis.window`) -
// the second `window` is a realm self-reference no read can find absent, so it earns no test of its
// own, and the key's effect still runs only past the short-circuit, where the source runs it.
const log = [];
const v = globalThis.window?.window?.[(log.push("k"), "self")]?.Array.of(7).at(0);
use(v, log);
