import _Object$keys from "@core-js/pure/actual/object/keys";
export const namespacedNotRef = function L({
  keys: _unused,
  ...rest
} = Object) {
  let keys = _Object$keys;
  return <ns:L x={1}>{keys(rest).length}</ns:L>;
}();