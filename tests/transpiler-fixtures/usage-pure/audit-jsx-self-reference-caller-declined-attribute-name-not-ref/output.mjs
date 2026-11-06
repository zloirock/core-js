import _Object$assign from "@core-js/pure/actual/object/assign";
export const attributeNameNotRef = function H({
  assign: _unused,
  ...rest
} = Object) {
  let assign = _Object$assign;
  return <div H={1}>{assign({}, rest, {
      a: 1
    }).a}</div>;
}();