// a live `?.` in the TAIL decides whether the delete happens, so no fold owns the run: it stays
// spelled and lands on the deepest span pure can back, the terminal probe read left as written.
// a `?.` deeper in the run tests a value that cannot be absent and goes with the span it names.
// the negatives pin the boundary - a plain tail folds the whole navigation onto the root binding,
// and a run with no backed hop keeps the root's own. no slot is written here on purpose: a write
// to the deleted name routes the run through the mutated-slot channel and the rows go vacuous
delete (globalThis.self?.window)?.a.deleteBox;
delete (globalThis?.self.window)?.a.deleteBox;
delete (globalThis.self.window)?.a.b.deleteBox;
delete (globalThis.self?.window).a.deleteBox;
delete (globalThis.window)?.a.deleteBox;
