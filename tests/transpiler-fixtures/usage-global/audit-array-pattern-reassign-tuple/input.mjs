// Tuple reassign narrows per slot - position 0 is string, position 1 is number.
// Distinct methods (`.at` vs `.toFixed`) per slot makes the per-slot narrowing
// observable: a regression that collapses to the union type would emit both array
// and string variants for `.at` (no Number.prototype.toFixed overlap).
declare const data: [string, number];
let head, tail;
[head, tail] = data;
head.at(0);
tail.toFixed(2);
