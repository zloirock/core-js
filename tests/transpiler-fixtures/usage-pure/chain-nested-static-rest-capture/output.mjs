import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _ref3, _ref4, _unused, _unused2;
// A nested container remains the result of both assignments; each read is polyfilled.
let from, rest;
const source = {
  w: Array,
  extra: 1
};
const held = (_ref = (_ref2 = source, _ref3 = _ref2["w"], from = _Array$from, _ref3, {
  w: _unused,
  ...rest
} = _ref2, _ref2), _ref4 = _ref["w"], from = _Array$from, _ref4, {
  w: _unused2,
  ...rest
} = _ref, _ref);
use(held === source, from([1]), rest);