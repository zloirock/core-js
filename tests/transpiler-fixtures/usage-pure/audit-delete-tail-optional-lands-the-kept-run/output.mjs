import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a live `?.` in the TAIL decides whether the delete happens, so no fold owns the run: it stays
// spelled and lands on the deepest span pure can back, the terminal probe read left as written.
// a `?.` deeper in the run tests a value that cannot be absent and goes with the span it names.
// the negatives pin the boundary - a plain tail folds the whole navigation onto the root binding,
// and a run with no backed hop keeps the root's own. no slot is written here on purpose: a write
// to the deleted name routes the run through the mutated-slot channel and the rows go vacuous
delete _self.window?.a.deleteBox;
delete _self.window?.a.deleteBox;
delete _self.window?.a.b.deleteBox;
delete _globalThis.a.deleteBox;
delete _globalThis.window?.a.deleteBox;