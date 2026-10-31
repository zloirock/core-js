import _Object$entries from "@core-js/pure/actual/object/entries";
function Tail({
  entries: _unused,
  ...rest
} = Object) {
  let entries = _Object$entries;
  return [entries, rest];
}