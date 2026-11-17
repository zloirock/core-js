import _Array$from from "@core-js/pure/actual/array/from";
var _unused, _unused2;
// Static rest exclusions in both loop slots declare their sentinels outside the header.
let from,
  rest,
  index = 0;
for (from = _Array$from, {
  from: _unused,
  ...rest
} = Array, Array; index < 2; index++, from = _Array$from, {
  from: _unused2,
  ...rest
} = Array, Array) {
  use(from([index]), rest);
}