import _Object$entries from "@core-js/pure/actual/object/entries";
export const memberTailNotRef = function K({
  entries: _unused,
  ...rest
} = Object) {
  let entries = _Object$entries;
  return <Other.K x={1}>{entries(rest).length}</Other.K>;
}();