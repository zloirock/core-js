import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// `Reflect.set` stores its VALUE into the target, so a holder handed there can be rewritten through the
// target and keeps no field narrow; the key slot only coerces the holder to a property key, which
// leaves its narrow standing
export function viaValue(target) {
  var _ref;
  const holder = {
    items: [1, 2]
  };
  _Reflect$set(target, 'k', holder);
  return _at(_ref = holder.items).call(_ref, 0);
}
export function viaKey(target) {
  var _ref2;
  const holder = {
    items: [1, 2]
  };
  _Reflect$set(target, holder, 1);
  return _includesMaybeArray(_ref2 = holder.items).call(_ref2, 1);
}