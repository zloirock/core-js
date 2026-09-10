// what the ROOT spells gates nothing above it: `window` has no pure entry, so the delete fold has
// no root to land and rides the deepest span pure can back instead of leaving the run raw. the
// negatives pin the boundary - a run with no backed hop at all stays raw whole, and a spellable
// root keeps its own binding whatever the hops above it spell. no slot is written here on purpose:
// a write to the deleted name routes the run through the mutated-slot channel and the rows go vacuous
delete (window.self).a.b.deleteBox;
delete (window.self)?.a.b.deleteBox;
delete (window.window).a.b.deleteBox;
delete (globalThis.self).a.b.deleteBox;
