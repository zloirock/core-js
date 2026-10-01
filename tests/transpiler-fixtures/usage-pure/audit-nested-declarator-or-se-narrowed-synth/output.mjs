import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// an effectful `||` init narrows the replacement to the LEFT TAIL: the effect prefix keeps
// running in place, the literal (always truthy, like the global it mirrors) keeps
// short-circuiting, and the dead right side stays verbatim
let c = 0;
const {
  Array: {
    from
  }
} = (c++, {
  Array: {
    from: _Array$from
  }
}) || _self;
from([1]);