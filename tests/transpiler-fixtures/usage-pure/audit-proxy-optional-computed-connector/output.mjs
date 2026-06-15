import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
// An OPTIONAL-COMPUTED connector on a substituted proxy-global root must normalize to a plain
// computed access: `globalThis?.['Array']` -> `_globalThis['Array']` (drop the whole `?.`, a
// computed access takes no dot). Stripping only the `?` would leave `_globalThis.['Array']`,
// which is a syntax error. Matches babel's normalizeOptionalChain.
const {
  from: _unused,
  ...rest
} = _globalThis['Array'];
from([1]);