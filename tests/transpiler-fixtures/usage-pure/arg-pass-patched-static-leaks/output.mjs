import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a static the module replaces runs the replacement, which may do anything with the holder it is
// handed: the registry no longer vouches for the call and the holder keeps no narrow; a static of a
// namespace the module leaves alone still vouches
Object.keys = replacement;
export function viaReplaced() {
  var _ref;
  const holder = {
    items: [1, 2]
  };
  Object.keys(holder);
  return _at(_ref = holder.items).call(_ref, 0);
}
export function viaUntouched() {
  var _ref2;
  const holder = {
    items: [1, 2]
  };
  _Reflect$ownKeys(holder);
  return _includesMaybeArray(_ref2 = holder.items).call(_ref2, 1);
}