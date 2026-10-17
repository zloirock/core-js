import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    var _ref;
    return _includesMaybeArray(_ref = this.entries).call(_ref, "a");
  }
}
const k = new Keeper();
k.entries = "string";