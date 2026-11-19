import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// cross-scope ambient class: `declare class Holder` lives at module scope, then inside an
// enclosing function `Holder.make()` is called whose static return is `string[]`. resolving
// the static must walk up enclosing scopes to reach the module-level declaration. distinct
// methods make each line trace to its declared overload's return shape
declare class Holder {
  static make(): string[];
  static peek(): string;
}
function inner() {
  var _ref, _ref2, _ref3;
  _findLastMaybeArray(_ref = Holder.make()).call(_ref, s => s);
  _atMaybeArray(_ref2 = Holder.make()).call(_ref2, 0);
  _includesMaybeString(_ref3 = Holder.peek()).call(_ref3, 'y');
}
inner();