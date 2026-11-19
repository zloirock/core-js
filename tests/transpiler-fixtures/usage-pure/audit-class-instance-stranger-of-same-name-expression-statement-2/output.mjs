import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// the stranger's instance is TRANSIENT, so the write lands straight on the construction
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    var _ref;
    return _includesMaybeArray(_ref = this.entries).call(_ref, "a");
  }
}
function strangerTransientWrite() {
  class Keeper {}
  new Keeper().entries = "string";
}
strangerTransientWrite();