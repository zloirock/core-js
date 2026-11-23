import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
export const log = [];
function eff(key) {
  _pushMaybeArray(log).call(log, key);
  return Object;
}
try {
  throw {
    w: [1]
  };
} catch (_ref) {
  let {
      [(eff('k'), 'w')]: _ref2
    } = null == _ref ? _ref[""] : _ref,
    a = _at(_ref2);
  (_pushMaybeArray(log) || 0).call(log, a.call([5], 0));
}