import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  var _ref;
  const {
    Array: {
      from,
      "x\u2028y": other
    }
  } = ({} = _ref = _globalThis.window, {
    Array: {
      from: _Array$from,
      "x\u2028y": _ref.Array["x\u2028y"]
    }
  });
  return [from([3])[0], typeof other];
}