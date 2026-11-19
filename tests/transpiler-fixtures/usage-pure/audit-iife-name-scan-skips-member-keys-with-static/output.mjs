import _Object$keys from "@core-js/pure/actual/object/keys";
const withStatic = function k({
  keys: _unused,
  ...rest
} = Object) {
  let keys = _Object$keys;
  class C {
    static k() {}
  }
  return [keys, rest, C];
}();
export { withStatic };