// a static synth reads a selection the build decides by the part of it that runs: under a `||` left the
// build decides, and in an IIFE argument - with a parameter default or without - as the operand alone:
// the argument it runs wins over the default
export function viaOr({ from } = (typeof Symbol != 'undefined' ? Array : Set) || Object) {
  return from;
}
export function viaAndOr({ of } = typeof Symbol != 'undefined' && Array || Object) {
  return of;
}
export const viaArgument = (({ groupBy }) => groupBy)(typeof Symbol != 'undefined' ? Map : Object);
export const viaArgumentOverDefault = (({ try: attempt } = Promise) => attempt)(typeof Symbol != 'undefined' ? Promise : Set);
