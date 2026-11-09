import _Map from "@core-js/pure/actual/map";
// A nested assignment default retains the pattern's static receiver.
let length, other;
({
  groupBy: {
    length = 9
  },
  other
} = _Map);
use(length, other);