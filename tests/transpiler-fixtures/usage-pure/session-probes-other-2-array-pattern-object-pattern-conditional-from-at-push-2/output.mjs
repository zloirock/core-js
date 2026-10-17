import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
  const [{
    from: f,
    at: a
  }] = [pick ? {
    from: _Array$from,
    at: Array.at
  } : userObj];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}