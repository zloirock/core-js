// STACKED unresolvable hops under an SE key: the guard tests the DEEPER PREFIX
// (`_globalThis.window?.window`, the plan's own node) - descending to the bottom probe
// would drop the source's `?.` from the test and split the emitters on the boundary.
// the text sidecar records the accepted lag of that layer (the corpus textLags class):
// the claim inside the kept computed key is re-emitted raw there
const log = [];
const v = globalThis.window?.window?.[(log.push("k"), "self")]?.Array.of(7).at(0);
use(v, log);
