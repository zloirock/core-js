// the setter read off a name holding the `Reflect` namespace - an alias of the global or of a realm read -
// installs the prototype as the setter read off `Reflect` itself does, so the object dispatches the
// installed family; a parameter shadowing `Reflect` or a user object owning a `setPrototypeOf` installs
// nothing the build can name. the `Reflect` reads load its own modules
const R = Reflect;
const aliased = {};
R.setPrototypeOf(aliased, Array.prototype);
export const a = aliased.at(-1);
const G = globalThis.Reflect;
const viaRealm = {};
G.setPrototypeOf(viaRealm, Array.prototype);
export const b = viaRealm.flatMap(f);
export function shadowed(Reflect) {
  const S = Reflect;
  const target = {};
  S.setPrototypeOf(target, Array.prototype);
  return target.flat();
}
const U = { setPrototypeOf() {} };
const owned = {};
U.setPrototypeOf(owned, Array.prototype);
export const d = owned.toSorted();
