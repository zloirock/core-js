import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `static /*c*/ /*d*/ {` should still anchor at the open brace, not at a `{`
// inside any of the comments
class K {
  static /*foo {*/ /*bar*/
  {
    const arr = [1, 2];
    _atMaybeArray(arr).call(arr, -1);
  }
}
new K();