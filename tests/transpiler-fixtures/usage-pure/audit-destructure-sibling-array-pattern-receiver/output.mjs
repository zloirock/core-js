import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a preserved sibling holding an ArrayPattern-WRAPPED nested proxy destructure is flatten-eligible
// like the bare object form; the outer sibling-walk must skip its receiver, or a queued transform
// survives the inner flatten overwrite and crashes text composition
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  val = function () {
    const [{
      Array: {
        of
      }
    }] = [{
      Array: {
        of: _Array$of
      }
    }];
    return of;
  }();
export { from, val };