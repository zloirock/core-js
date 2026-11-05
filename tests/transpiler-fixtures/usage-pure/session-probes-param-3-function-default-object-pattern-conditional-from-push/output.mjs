import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A parameter default keeps native selecting slot reads and supplied user values.
// The separate Array.from comparison and push call remain independently polyfilled.
let pick = 1;
const userObj = {};
const log = [];
{
  function g({
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  }) {
    return f;
  }
  (_pushMaybeArray(log) || 0).call(log, g() === _Array$from, g({
    w: userObj
  })());
}