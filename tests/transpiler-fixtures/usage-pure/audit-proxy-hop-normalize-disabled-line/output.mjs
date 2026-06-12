import _Array$from from "@core-js/pure/actual/array/from";
// a disabled line opts out of the normalization reshaping as well as the polyfills,
// while the sibling line keeps its own injection
// core-js-disable-next-line
const {
  Map: {
    groupBy
  }
} = globalThis;
// a MULTILINE disabled statement gates on its first line too
// core-js-disable-next-line
const {
  Promise: {
    allSettled
  }
} = globalThis;
export const r = _Array$from([groupBy, allSettled]);