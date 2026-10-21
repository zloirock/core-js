import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
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