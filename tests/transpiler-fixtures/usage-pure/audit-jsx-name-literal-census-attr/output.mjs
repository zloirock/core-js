import _Object$assign from "@core-js/pure/actual/object/assign";
function Attr({
  assign: _unused,
  ...rest
} = Object) {
  let assign = _Object$assign;
  return [assign, rest];
}