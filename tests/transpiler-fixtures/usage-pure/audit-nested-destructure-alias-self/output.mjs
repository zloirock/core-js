import _Array$from from "@core-js/pure/actual/array/from";
// Nested destructure `const { Array: { from } } = self` - `self` works as a
// proxy-global just like `globalThis`. Plugin flattens through the nested pattern
// and rewrites `from` to the pure `Array.from` polyfill.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
from([1, 2, 3]);