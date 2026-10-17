import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const log = [];
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  const v = ((_ref, _unused = void 0) => {
    let at = _atMaybeArray(_ref);
    return at;
  })(mark('e', [0]));
}