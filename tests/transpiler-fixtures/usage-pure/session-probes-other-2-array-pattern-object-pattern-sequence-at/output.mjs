import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
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
  }] = [(mark++, pick ? {
    from: _Array$from
  } : userObj)];
}
{
  const [{
    from: f
  }] = [pick ? (mark++, {
    from: _Array$from
  }) : userObj];
}
{
  const [_ref] = [{
    w: (mark(), arr)
  }];
  const m = _atMaybeArray(_ref.w);
  use(m);
}