import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A bare global read beside a nested static keeps its own pure binding.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  host = _globalThis;
export { from, host };