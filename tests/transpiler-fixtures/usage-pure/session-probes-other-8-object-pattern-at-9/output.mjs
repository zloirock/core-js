import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const log = [];
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  const _ref = {
    w: (mark(), arr),
    z: 1
  };
  const m = _atMaybeArray(_ref.w);
  const {
    z
  } = _ref;
  use(m, z);
}
{
  const _ref2 = {
    z: tick('z', 1),
    w: tick('w', arr)
  };
  const m = _at(_ref2.w);
  const {
    z
  } = _ref2;
  use(m, z);
}