import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
const of = _Array$of;
// mixed nested destructure - some inner props polyfillable (Array.from, Array.of), some
// not (Array.isArray isn't needed on our targets), plus a non-polyfill outer sibling
// (NaN). batch extracts the resolvable ones, leaves the rest in a trimmed destructure
const {
  Array: {
    isArray
  },
  NaN: nan
} = _globalThis;
from([1]);
of(1);
isArray([1]);
console.log(nan);