import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
const log = [];
function eff() {
  return Object;
}
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  const [, _ref] = [eff(), {
    y: (mark(), getArr())
  }];
  const ci = _at(_ref.y);
  use(ci);
}