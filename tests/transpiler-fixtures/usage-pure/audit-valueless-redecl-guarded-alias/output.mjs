import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a bare `var X;` redeclaration twin lands first in the binding's violation list as a phantom
// (no value flows through it); the guard verdict for an assignment-form aliasing write must
// skip it and judge the REAL write - here the only aliasing assignment sits under a branch, so
// the read stays native (a fold would substitute the polyfill on the untaken path where the
// runtime value is undefined). the single-declaration control is guarded the same way.
var assigned;
var assigned;
if (Math.random() > 2) {
  assigned = _Symbol$iterator;
}
export const viaTwin = [][assigned];
var single;
if (Math.random() > 2) {
  single = _Symbol$asyncIterator;
}
export const viaSingle = [][single];