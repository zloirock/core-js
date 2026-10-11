// a write of a binding in another function - a setter, a mode switch - may run at any time, so no one
// value is what a read of the binding observes, whatever a write the read's own frames settle says: a
// receiver, a computed key and a container slot read through such a binding keep every value it may hold
let Impl;
export function useLegacy() {
  Impl = LegacyMap;
}
if (typeof Map != 'undefined') Impl = Map;
else Impl = LegacyMap;
export const group = items => Impl.groupBy(items, item => item.kind);
let method = 'from';
export function useOf() {
  method = 'of';
}
export const build = value => Array[method](value);
let box = { C: Iterator };
export function useArrays() {
  box = { C: Array };
}
export const wrap = value => box.C.from(value);
