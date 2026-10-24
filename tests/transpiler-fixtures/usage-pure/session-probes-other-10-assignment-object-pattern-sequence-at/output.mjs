import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const arr = [1, 2];
const log = [];
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  let m;
  ({
    w: (mark(), arr)
  });
  m = _atMaybeArray(arr);
  use(m);
}