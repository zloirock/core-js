import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
export const twoNestedValues = (({
  Set: S8,
  Array: {
    of: of8
  },
  Promise: {
    race
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  },
  Promise: {
    race: _Promise$race
  }
}) => [S8, of8, race])();