import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a chain assignment with a GUARDED RHS must not flatten (the destructure read of a falsy
// value keeps its native TypeError) and must not mirror the RHS either - the binding is
// observable and must capture the native value; the leaf default is the sound emission
let w;
let m = 1;
const {
  Array: {
    from = _Array$from
  }
} = w = m && _globalThis;
from([1]);