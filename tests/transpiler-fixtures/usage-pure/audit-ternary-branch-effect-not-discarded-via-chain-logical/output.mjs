import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a chain assignment wrapping a logical fallback keeps both the write and the fallback
let c2 = Math.random() < 0.5;
let w,
  m = null;
let x2 = {
  Array: {
    from: v => v
  }
};
const {
    Array: _ref
  } = c2 ? w = m || _globalThis : x2,
  arrayFrom = _ref === Array ? _Array$from : _ref.from;
export const viaChainLogical = arrayFrom([1, 2]);