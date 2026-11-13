import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The caller census and the direct IIFE keep the same source guard.
const held = _globalThis.window?.Array;
function read({
  from
}) {
  return from;
}
export const result = read((_ref => {
  return _ref == null ? _ref : {
    from: _Array$from
  };
})(held));