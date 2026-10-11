import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
// the setter read off a name holding the `Reflect` namespace - an alias of the global or of a realm read -
// installs the prototype as the setter read off `Reflect` itself does, so the object dispatches the
// installed family; a parameter shadowing `Reflect` or a user object owning a `setPrototypeOf` installs
// nothing the build can name. the `Reflect` reads load its own modules
const R = _Reflect;
const aliased = {};
_Reflect$setPrototypeOf(aliased, Array.prototype);
export const a = _atMaybeArray(aliased).call(aliased, -1);
const G = _Reflect;
const viaRealm = {};
_Reflect$setPrototypeOf(viaRealm, Array.prototype);
export const b = _flatMapMaybeArray(viaRealm).call(viaRealm, f);
export function shadowed(Reflect) {
  const S = Reflect;
  const target = {};
  S.setPrototypeOf(target, Array.prototype);
  return target.flat();
}
const U = {
  setPrototypeOf() {}
};
const owned = {};
U.setPrototypeOf(owned, Array.prototype);
export const d = owned.toSorted();