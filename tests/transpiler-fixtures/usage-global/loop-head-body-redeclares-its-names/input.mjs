// A loop head or catch pattern whose body block declares a name the pattern binds or reads stays
// where it is: moved into that block it would redeclare the name, or read the body's binding in
// place of the outer one. A shadow in a nested block leaves the top of the body free.
for (const { at, flat } of list) { const flat = 1; use(at, flat); }
for (const { w: [{ findLast }] } of list) { let findLast = 2; use(findLast); }
for (const { [key]: m, includes } of list) { let key = 3; use(m, includes); }
let target;
for ({ entries: target } of list) { let target = 4; use(target); }
try { risky(); } catch ({ values = fallback }) { let fallback = 5; use(values); }
for (const { flatMap } of list) { { let flatMap = 6; use(flatMap); } use(flatMap); }
