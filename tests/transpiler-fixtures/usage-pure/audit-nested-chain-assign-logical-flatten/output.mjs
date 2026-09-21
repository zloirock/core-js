import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A chain assignment keeps its original value and native short-circuiting.
// Its nested static still receives the pure method.
let w;
const {
  Array: {
    from
  }
} = (w = _globalThis || _self, {
  Array: {
    from: _Array$from
  }
});
from([1]);