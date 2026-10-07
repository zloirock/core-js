import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A chain assignment keeps its value - the left the selection always yields (`globalThis`), its dead
// `self` dropped - and its nested static still receives the pure method.
let w;
const {
  Array: {
    from
  }
} = (w = _globalThis, {
  Array: {
    from: _Array$from
  }
});
from([1]);