import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _unused, _unused2;
// Both array patterns read the same captured container and exclude the static from rest.
let from, rest;
const source = [Array];
const held = ([_ref] = _ref2 = ([_ref3] = _ref4 = source, _ref5 = _ref3, from = _Array$from, {
  from: _unused,
  ...rest
} = _ref5, _ref5, _ref4), _ref6 = _ref, from = _Array$from, {
  from: _unused2,
  ...rest
} = _ref6, _ref6, _ref2);
use(held === source, from([1]), rest);