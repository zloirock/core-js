import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
  class C5 {
    static {
      const [{
        from: f
      }] = [pick ? {
        from: _Array$from
      } : userObj];
      C5.f = f;
    }
  }
  _pushMaybeArray(log).call(log, C5.f === _Array$from);
}