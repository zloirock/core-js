import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2;
// A nested container remains the result of both assignments; each read is polyfilled.
let from, rest;
const source = {
  w: Array,
  extra: 1
};
const held = ({
  w: {},
  ...(_ref = [from = _Array$from])[0]
} = source, rest = _ref[0], source, {
  w: {},
  ...(_ref2 = [from = _Array$from])[0]
} = source, rest = _ref2[0], source);
use(held === source, from([1]), rest);