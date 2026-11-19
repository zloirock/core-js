// a bare `var X;` redeclaration twin lands first in the binding's violation list as a phantom
// (no value flows through it); the guard verdict for an assignment-form aliasing write must
// skip it and judge the REAL write - here the only aliasing assignment sits under a branch, so
// the read stays native (a fold would substitute the polyfill on the untaken path where the
// runtime value is undefined). the single-declaration control is guarded the same way.
var assigned;
var assigned;
if (Math.random() > 2) {
  ({ iterator: assigned } = Symbol);
}
export const viaTwin = [][assigned];
var single;
if (Math.random() > 2) {
  ({ asyncIterator: single } = Symbol);
}
export const viaSingle = [][single];
