import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// Every write arm is non-callable, so the installed body remains scannable.
const flag = false;
class Box {
  static data() {}
}
Box.change = function () {
  this.data = flag ? '1020' : '10200';
};
Box.change();
export const result = _includesMaybeString(_ref = Box.data).call(_ref, '02');