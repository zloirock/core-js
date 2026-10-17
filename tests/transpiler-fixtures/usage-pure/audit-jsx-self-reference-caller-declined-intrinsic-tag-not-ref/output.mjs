import _Object$values from "@core-js/pure/actual/object/values";
export const intrinsicTagNotRef = function div({
  values: _unused,
  ...rest
} = Object) {
  let values = _Object$values;
  return <div>{values(rest).length}</div>;
}();