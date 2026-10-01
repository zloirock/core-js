import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _ref3, _ref4, _unused, _unused2;
// Both array patterns read the same captured container and exclude the static from rest.
let from, rest;
const source = [Array];
const held = ([_ref] = _ref2 = ([_ref3] = _ref4 = source, from = _Array$from, {
  from: _unused,
  ...rest
} = _ref3, _ref3, _ref4), from = _Array$from, {
  from: _unused2,
  ...rest
} = _ref, _ref, _ref2);
use(held === source, from([1]), rest);