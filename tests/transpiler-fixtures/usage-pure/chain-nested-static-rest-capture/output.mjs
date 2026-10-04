import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _unused, _unused2;
// A nested container remains the result of both assignments; each read is polyfilled.
let from, rest;
const source = {
  w: Array,
  extra: 1
};
const held = ({} = source, _ref = source.w, from = _Array$from, _ref, {
  w: _unused,
  ...rest
} = source, source, _ref2 = source.w, from = _Array$from, {
  w: _unused2,
  ...rest
} = source, source);
use(held === source, from([1]), rest);