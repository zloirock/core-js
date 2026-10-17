import _Object$entries from "@core-js/pure/actual/object/entries";
const withAccessor = function h({
  entries: _unused,
  ...rest
} = Object) {
  let entries = _Object$entries;
  class C {
    get h() {
      return 1;
    }
  }
  return [entries, rest, C];
}();
export { withAccessor };