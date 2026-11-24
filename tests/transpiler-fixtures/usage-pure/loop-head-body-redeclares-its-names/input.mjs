// A separate body block keeps its lexical names out of head defaults and computed keys.
// Shadowed bindings may stay native while independently observed methods receive their polyfills.
for (const { at, flat } of list) { const flat = 1; use(at, flat); }
for (const { w: [{ findLast }] } of list) { let findLast = 2; use(findLast); }
for (const { [key]: m, includes } of list) { let key = 3; use(m, includes); }
let target;
for ({ entries: target } of list) { let target = 4; use(target); }
try { risky(); } catch ({ values = fallback }) { let fallback = 5; use(values); }
for (const { flatMap } of list) { { let flatMap = 6; use(flatMap); } use(flatMap); }
