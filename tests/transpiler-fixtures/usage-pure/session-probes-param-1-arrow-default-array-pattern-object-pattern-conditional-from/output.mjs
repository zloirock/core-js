import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// probe corpus of the defense cycles over the destructure wrappers, family "param", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
  const r = (([{
    from: f
  }] = [_Set]) => f)([pick ? {
    from: _Array$from
  } : userObj]);
}