import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
const log = [];
function eff() {
  return Object;
}
{
  const {
      Array: {
        prototype: _ref
      }
    } = _globalThis,
    a = null == _ref ? _ref[""] : (eff('k2'), _atMaybeArray(_ref));
  (_pushMaybeArray(log) || 0).call(log, a.call([3], 0));
}