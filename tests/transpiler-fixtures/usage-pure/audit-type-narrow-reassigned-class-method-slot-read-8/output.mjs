import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// merely HOLDING an alias writes nothing - the slot keeps its narrow
class AliasedIntact {
  static feed() {
    return [15, 16];
  }
  static read() {
    var _ref;
    return _includesMaybeArray(_ref = AliasedIntact.feed()).call(_ref, 15);
  }
}
const Untouched = AliasedIntact;
export const values = [AliasedIntact.read(), Untouched];