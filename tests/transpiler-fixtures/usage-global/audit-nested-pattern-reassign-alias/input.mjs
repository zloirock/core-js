// a binding aliased to a built-in through a NESTED destructuring reassignment (`[[A]] = [[Map]]`,
// `{ x: [B] } = ...`) must still resolve so usage-global injects the static it needs - the pattern
// walker recurses into nested array / object slots, not just the outer level. both bindings call a
// STATIC (gated on the receiver resolving), so each nested shape independently drives an injection
let A;
[[A]] = [[Map]];
A.groupBy([], (x) => x);

let B;
({ x: [B] } = { x: [Object] });
B.fromEntries([["k", 1]]);
