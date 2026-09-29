import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// Enumerated writes preserve Function/String alternatives; only String includes is needed.
class Box {
  static data() {}
}
const box = Box;
box.change = function () {
  this.data = "1020";
};
box.change();
export const result = _includesMaybeString(_ref = box.data).call(_ref, "02");