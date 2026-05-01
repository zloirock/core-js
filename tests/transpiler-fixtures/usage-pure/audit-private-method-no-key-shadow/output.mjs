import _at from "@core-js/pure/actual/instance/at";
// `#at()` is a private method - private name (PrivateIdentifier) cannot shadow
// the public Array.prototype.at polyfill name. `staticKeyName` filters
// PrivateIdentifier explicitly so `arr.at(0)` polyfills regardless of private member name
class Wrapper {
  #at() {
    return 'private';
  }
  fillFrom(arr) {
    return _at(arr).call(arr, 0);
  }
}
export { Wrapper };