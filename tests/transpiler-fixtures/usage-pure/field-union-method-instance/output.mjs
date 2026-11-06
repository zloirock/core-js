import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A callable initializer does not prove that later slot values remain functions.
class Box {
  data() {}
}
const box = new Box();
box.data = [10, 20];
export const result = _includesMaybeArray(_ref = box.data).call(_ref, "02");