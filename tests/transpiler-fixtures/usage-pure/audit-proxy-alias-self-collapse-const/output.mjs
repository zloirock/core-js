import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A const alias of the realm object follows the same proxy-hop collapse as a direct
// global reference. The retained receiver reads g.Array rather than g.self.Array,
// which also works on hosts without native self. The receiver is evaluated once
// before the polyfilled extraction and the remaining-key copy.
const g = _globalThis;
const _ref = g.Array,
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1]);