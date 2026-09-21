import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$race from "@core-js/pure/actual/promise/race";
// Computed keys under a constructor hop keep their original effects and receive pure statics.
// Sibling statics share the mirror; a missing native constructor must not cause an extra throw.
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
const {
  Promise: {
    [(n++, 'all')]: sibling,
    allSettled
  }
} = {
  Promise: {
    all: _Promise$all,
    allSettled: _Promise$allSettled
  }
};
export const result = [typeof sole, typeof sibling, typeof allSettled, n];