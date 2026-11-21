import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// The writes belong to an unrelated superclass even when its name matches the reader's.
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    var _ref;
    return _includesMaybeArray(_ref = this.entries).call(_ref, "a");
  }
}
function strangerWithoutCollision() {
  class Unrelated {}
  class Tainted extends Unrelated {}
  new Tainted().entries = "string";
}
strangerWithoutCollision();
export const found = new Keeper().hasFirst();