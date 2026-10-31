import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
function noTag({
  fromEntries: _unused,
  ...rest
} = Object) {
  let fromEntries = _Object$fromEntries;
  return [fromEntries, rest];
}
export const control = noTag();