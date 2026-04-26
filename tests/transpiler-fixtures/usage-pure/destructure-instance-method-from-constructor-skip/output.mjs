import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// `from` is a static of `Array` and is rewritten via the constructor-static path.
// `includes` is an instance method (only on `Array.prototype`), so destructuring it
// from `Array` itself is not a polyfill site - that key is left in the destructure.
const {
  includes
} = Array;