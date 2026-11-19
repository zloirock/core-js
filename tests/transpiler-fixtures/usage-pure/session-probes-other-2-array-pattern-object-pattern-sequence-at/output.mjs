import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Effects in selecting array elements and literal slots stay at their source positions.
// The supported nested at receiver is captured; static-only from patterns remain native.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  const [{
    from: f
  }] = [(mark++, pick ? Array : userObj)];
}
{
  const [{
    from: f
  }] = [pick ? (mark++, Array) : userObj];
}
{
  const [_ref] = [{
    w: (mark(), arr)
  }];
  const m = _atMaybeArray(_ref.w);
  use(m);
}