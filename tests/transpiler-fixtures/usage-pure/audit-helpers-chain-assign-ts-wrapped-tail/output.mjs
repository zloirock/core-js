import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// fallback-receiver peel alternates chain-assign + paren+TS wrappers until stable.
// here a chain-assign sits inside a TS as-any cast, then another paren wraps the outer
// chain-assign, then a SE-prefix without observable effects, finally the conditional.
// the peel reaches the selection through all three wrappers and substitutes the branch
// CONSTRUCTORS - but the per-branch static dispatch the same selection takes without an
// assignment stands down here: the chain-assign's value is what `r` receives, and a synth
// literal in that slot would store the extraction rather than the constructor. so a static
// off the branch whose constructor pure never replaces (`Array`) stays native, which is the
// price of keeping `r` intact. distinct globals per row keep each substitution attributable
let r;
export const {
  from
} = r = (cond ? Array : _Iterator) as any;
export const {
  groupBy: grouped
} = r = (0, cond ? Object : _WeakSet);
export const {
  groupBy
} = (r = cond ? _Map : _WeakMap) as any;
export { r };