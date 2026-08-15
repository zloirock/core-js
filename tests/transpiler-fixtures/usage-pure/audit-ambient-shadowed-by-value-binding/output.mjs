import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a nearer value binding is what the call really reaches: the ambient declaration of the
// same name is only in play when nothing shadows it. the parameter form has no initializer to
// walk, so it fell through to the ambient probe and answered with the other family
declare function make(): number[];
export function viaParam(make: () => string) {
  var _ref;
  return _atMaybeString(_ref = make()).call(_ref, 0);
}
export function unshadowed() {
  var _ref2;
  return _includesMaybeArray(_ref2 = make()).call(_ref2, 1);
}