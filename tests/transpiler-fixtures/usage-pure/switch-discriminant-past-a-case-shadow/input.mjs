// the switch DISCRIMINANT is evaluated in the enclosing environment, so a case-level lexical
// does not cover it, while a `var` in the same case does - it hoists to the function scope.
// the third line reads inside the case under its own shadow and the fourth has no shadow at
// all; one family per line so a lost decision shows up in the import set.
switch (Object.entries({ a: 1 }).length) { case 1: let Object = 1; break; }
switch (Reflect.ownKeys({ b: 2 }).length) { case 1: var Reflect = 1; break; }
switch (0) { case 1: let Set = 1; new Set([1]); break; }
switch (0) { case 1: Promise.allSettled([]); break; }
