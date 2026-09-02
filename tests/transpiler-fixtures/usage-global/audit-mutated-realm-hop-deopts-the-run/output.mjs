import "core-js/modules/es.global-this";
// a realm hop whose SLOT the source replaced deopts the run WHOLE: the hops below it fold only
// together with the read above them, so dropping them leaves the kept hop reading off a base the
// source never wrote. the read and the `delete` take one verdict, and the negative below is the
// hop nothing reads THROUGH - a slot the source names to delete it is the operator's own target,
// which is exactly why the census calls it mutated. this flavor rewrites nothing, so what it locks
// is the IMPORT SET: the fold the rows name is a pure-render rule, and the guard here is that a
// written realm slot does not change what gets injected around it
const box = {
  customProp: 1
};
globalThis.self = fake;
export const readThrough = globalThis.window.self.box.customProp;
export const deleted = delete globalThis.window.self.customProp;