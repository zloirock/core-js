import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Optional connectors over a backed realm root are redundant. The proxy run
// globalThis?.self?.Array lands on _self.Array, and that receiver is evaluated once
// before the polyfilled extraction and the remaining-key copy.
const _ref = _self.Array,
  from = null == _ref ? _ref[""] : _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1]);