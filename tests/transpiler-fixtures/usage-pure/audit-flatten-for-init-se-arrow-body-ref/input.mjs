// for-init nested-proxy flatten + SE-prefix IIFE: the for-statement init has no statement
// slot to host the lifted SE prefix, so `for-init SE-sink injection` synthesizes a
// `_unused = (sePrefix, tail)` sink. scope-tracker's `var _ref;` insert anchored inside
// the SE-prefix arrow body must be baked into the synthesized sink with seExpr-local
// coordinates - the synthesized buffer is no longer position-aligned with the original
// source, so a generic original-coord splice would corrupt the buffer (and adjacent
// `globalThis -> _globalThis` substitution).
for (const { Array: { from } } = ((() => [].values())(), globalThis); false;) from([]);
