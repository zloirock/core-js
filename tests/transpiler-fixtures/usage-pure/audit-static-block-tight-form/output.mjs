import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// static block without space between `static` and `{` must still allow var-scope
// anchor for nested polyfill ref allocation
class C {
  static {
    const arr = [1, 2, 3];
    _includesMaybeArray(arr).call(arr, 2);
  }
}
new C();