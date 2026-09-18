import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$race from "@core-js/pure/actual/promise/race";
// An SE-key static under a CONSTRUCTOR hop owes the receiver spelling its non-SE twin gets on the
// same host: the MIRROR literal, one import per member read and the key left in the untouched LHS,
// where its effect runs exactly once. The capture that owned this before bound the realm's own key -
// nothing on an engine without the constructor - and its guard turned that miss into a throw.
// The boundary - a hop naming a global with no constructor ponyfill, whose realm read is present on
// every floor and keeps its fold - is pinned by the corpus row of the same name, which asks for the
// runtime and the import parity rather than for a spelling neither binding owes the other. The
// sibling row carries a sidecar: one binding renames the consumed slot to a sentinel where the other
// drops it, and reading a slot off a literal we minted has no effect either way.
let n = 0;
const {
  Promise: {
    [(n++, 'race')]: sole
  }
} = {
  Promise: {
    race: _Promise$race
  }
};
const allSettled = _Promise$allSettled;
const {
  Promise: {
    [(n++, 'all')]: sibling,
    allSettled: _unused
  }
} = {
  Promise: {
    all: _Promise$all,
    allSettled: _Promise$allSettled
  }
};
export const result = [typeof sole, typeof sibling, typeof allSettled, n];