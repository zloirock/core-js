import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
let held;
const {
  Array: {
    of: {
      length
    }
  }
} = ({} = held = _globalThis.window, {
  Array: {
    of: _Array$of
  }
});
r = [length, held === _globalThis];