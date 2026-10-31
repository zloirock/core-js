import _Array$of from "@core-js/pure/actual/array/of";
const withField = function g({
  of: _unused,
  ...rest
} = Array) {
  let of = _Array$of;
  class C {
    g = 1;
  }
  return [of, rest, C];
}();
export { withField };