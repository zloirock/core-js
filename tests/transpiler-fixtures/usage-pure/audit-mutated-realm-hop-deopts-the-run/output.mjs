import _globalThis from "@core-js/pure/actual/global-this";
// a realm hop whose SLOT the source replaced deopts the run WHOLE: the hops below it fold only
// together with the read above them, so dropping them leaves the kept hop reading off a base the
// source never wrote. the read and the `delete` take one verdict, and the negative below is the
// hop nothing reads THROUGH - a slot the source names to delete it is the operator's own target,
// which is exactly why the census calls it mutated
const box = {
  customProp: 1
};
_globalThis.self = fake;
export const readThrough = _globalThis.window.self.box.customProp;
export const deleted = delete _globalThis.window.self.customProp;