// `#at()` is a private method - private name (PrivateIdentifier) cannot shadow
// the public Array.prototype.at polyfill name. `staticKeyName` filters
// PrivateIdentifier explicitly so `arr.at(0)` polyfills regardless of private member name
class Wrapper {
  #at() { return 'private'; }
  fillFrom(arr) {
    return arr.at(0);
  }
}
export { Wrapper };
