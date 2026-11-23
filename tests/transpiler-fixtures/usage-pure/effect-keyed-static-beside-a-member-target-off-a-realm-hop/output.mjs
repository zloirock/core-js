import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A static read between a member target and a native slot evaluates its computed key once.
// Both the probed window and the direct realm retain the order of the three writes.
let f4, c4, f6, c6;
const o = {};
({
  Array: {
    isArray: o.g,
    [(e(), "fromAsync")]: f4,
    custom: c4
  }
} = (_ref => {
  return {} = _ref, {
    Array: (_ref2 => {
      return _ref2 == null ? _ref2 : {
        isArray: _ref2.isArray,
        fromAsync: _Array$fromAsync,
        get custom() {
          return _ref2.custom;
        }
      };
    })(_ref.Array)
  };
})(_globalThis.window));
({
  Array: {
    isArray: o.h,
    [(e(), 'of')]: f6,
    custom: c6
  }
} = {
  Array: (_ref3 => {
    return _ref3 == null ? _ref3 : {
      isArray: _ref3.isArray,
      of: _Array$of,
      get custom() {
        return _ref3.custom;
      }
    };
  })(_globalThis.Array)
});