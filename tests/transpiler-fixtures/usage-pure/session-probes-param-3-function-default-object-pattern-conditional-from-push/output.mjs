import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "param", part 3:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
  function g({
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  }) {
    return f;
  }
  _pushMaybeArray(log).call(log, g() === _Array$from, g({
    w: userObj
  })());
}