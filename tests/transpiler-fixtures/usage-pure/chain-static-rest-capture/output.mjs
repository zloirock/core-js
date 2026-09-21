import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _unused, _unused2;
// Each assignment serves its own static read and yields the original receiver.
let from, rest;
const held = (_ref = (_ref2 = Array, from = _Array$from, {
  from: _unused,
  ...rest
} = _ref2, _ref2), from = _Array$from, {
  from: _unused2,
  ...rest
} = _ref, _ref);
use(held === Array, from([1]), rest);