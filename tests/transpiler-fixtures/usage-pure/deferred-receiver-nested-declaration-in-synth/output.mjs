import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function source(cb) {
  cb();
  return Array;
}
const value = (({
  of,
  isArray
}) => [typeof of, typeof isArray])(function (_ref) {
  return {
    of: _Array$of,
    get isArray() {
      return _ref.isArray;
    }
  };
}(source(() => {
  const fromEntries = _Object$fromEntries;
  eff(fromEntries([["x", 7]]).x);
})));
r = value;