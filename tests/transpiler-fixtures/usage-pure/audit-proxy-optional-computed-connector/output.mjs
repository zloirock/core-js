import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An OPTIONAL-COMPUTED connector on a substituted proxy-global root must normalize to a plain
// computed access: `globalThis?.['Array']` -> `_globalThis['Array']` (drop the whole `?.`, a
// computed access takes no dot). Stripping only the `?` would leave `_globalThis.['Array']`,
// which is a syntax error. Matches babel's normalizeOptionalChain.
const _ref = _globalThis['Array'],
  from = null == _ref ? _ref[""] : _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1]);