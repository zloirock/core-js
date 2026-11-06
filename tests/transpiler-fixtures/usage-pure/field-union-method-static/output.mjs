import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A callable initializer does not prove that later slot values remain functions.
class Box {
  static data() {}
}
Box.data = [10, 20];
export const result = _includesMaybeArray(_ref = Box.data).call(_ref, "02");