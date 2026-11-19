import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// the writing subclass belongs to a DIFFERENT class that merely shares the name, so it must not be
// taken for a descendant - the narrow survives and only the array leg appears
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
function strangerOfTheSameName() {
  class Holder {}
  class Poison extends Holder {}
  new Poison().items = "string";
}
strangerOfTheSameName();