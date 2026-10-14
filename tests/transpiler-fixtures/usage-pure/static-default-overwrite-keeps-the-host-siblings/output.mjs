import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A static's defaulted leaf extracts as an overwrite that replaces the whole assignment, so it takes
// the host only where the leaf stands there alone. A sibling at the outer level - an unknown computed
// key, an opted-out hop - keeps its own write in the residual beside the extraction.
let from, value, of, groupBy;
({
  [key]: value
} = _globalThis);
from = _Array$from;
({
  // core-js-disable-next-line
  Map: {
    groupBy
  }
} = _globalThis);
of = _Array$of;