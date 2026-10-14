import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// A retained getter runs once before the outer rest copy.
// Its proven static extracts off the hop the host pattern captures in place, rest beside it, and the
// assignment still yields the source object.
let count = 0;
const source = {
  get w() {
    count++;
    return Array;
  },
  extra: 7
};
let from, rest;
const held = (_ref = {
  w: {},
  ...rest
} = source, from = _Array$from, _ref);
export { count, from, rest };
console.log(held === source);