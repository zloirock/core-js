import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
const k = 'k';
{
  var t = 0,
    a = (k++, _atMaybeArray([1]));
}
function eff() {
  return Object;
}
{
  try {
    throw {
      w: [1]
    };
  } catch (_ref) {
    let {
        [(eff('k'), 'w')]: _ref2
      } = null == _ref ? _ref[""] : _ref,
      a = _at(_ref2);
    a;
  }
}