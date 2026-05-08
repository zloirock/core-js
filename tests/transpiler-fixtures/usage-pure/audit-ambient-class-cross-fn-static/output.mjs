import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// findAmbientClassPath cross-scope: `declare class Holder` lives at module scope, then
// inside an enclosing function we reference `Holder.make()` whose static return is
// `string[]`. `findAmbientClassPath` must walk up enclosing scope chains via
// `walkAmbientDeclarationPath`. Methods are distinct so each line traces to the
// declared overload's return shape
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