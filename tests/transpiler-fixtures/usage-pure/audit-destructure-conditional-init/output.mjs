import _Promise from "@core-js/pure/actual/promise/constructor";
// destructuring from a ternary whose branches are different global constructors -
// `from` should polyfill via Array, and the `Promise` constructor itself should also polyfill
const {
  from
} = cond ? Array : _Promise;