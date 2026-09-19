// four nested `Array.from(...)` calls; each must get its own polyfill
// substitution without overlap, even though they share the same callee.
Array.from(Array.from(Array.from(Array.from(s))));
