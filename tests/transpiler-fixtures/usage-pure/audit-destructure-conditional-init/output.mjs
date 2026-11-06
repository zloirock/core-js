import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructure from a ternary whose branches are different global constructors. each branch
// is handled independently: `Array` becomes a fresh object literal with the `Array.from`
// polyfill; `Promise` is replaced with the constructor polyfill (no static `Promise.from`)
const {
  from
} = cond ? {
  from: _Array$from
} : _Promise;