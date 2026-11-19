// the detector marks a claimed receiver's hops handled because the claim's render owns them - so an
// instance dispatch that re-emits that receiver has to hand it on as a COPY, the way the receiver-less
// arm does. memoizing the source node itself carried the marking into the rebuilt tree and every claim
// inside the receiver was suppressed on the re-visit, leaving a sealed proxy nav spelled raw where the
// read twin below renders the guard. a receiver the plugin BUILT keeps its identity: the nested
// dispatch's type record lives on that node, and a copy would drop it to the untyped helper
const ga = globalThis;
const nested = [[1]];
let out, read, dispatched, built;
read = (ga.window?.self).Array.prototype.at;
dispatched = (ga.window?.self).Array.prototype.at(1);
built = nested.flat().at(0);
out = [read, dispatched, built];
export const value = out;
