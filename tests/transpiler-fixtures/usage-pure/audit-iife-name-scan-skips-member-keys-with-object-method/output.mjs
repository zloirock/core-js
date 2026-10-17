import _Object$values from "@core-js/pure/actual/object/values";
const withObjectMethod = function m({
  values: _unused,
  ...rest
} = Object) {
  let values = _Object$values;
  const o = {
    m() {}
  };
  return [values, rest, o];
}();
export { withObjectMethod };