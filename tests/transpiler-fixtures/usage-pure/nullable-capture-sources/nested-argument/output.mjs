import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A nested parameter receives the original nullish value before rejecting it.
const held = null == _globalThis.window ? void 0 : _self;
export const result = (({
  Array: {
    from
  }
}) => from)((_ref => {
  return _ref == null ? _ref : {
    Array: {
      from: _Array$from
    }
  };
})(held));