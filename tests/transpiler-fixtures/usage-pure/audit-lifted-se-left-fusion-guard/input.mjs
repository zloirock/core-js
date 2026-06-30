// a lifted side-effect that re-roots a destructure-overwrite on a hazard char (`/re/` divides, `+x` / `-x`
// continue a binary) must not fuse LEFTWARD into a `;`-less prev statement at statement-list position. the
// original `const` / ASI-split `(` parsed statement-separate, but the rewrite carries no such guarantee:
// `i++` followed by `/x/...` divides into an unparsable line. babel is immune (AST insert); unplugin prepends
// a `;` to the overwrite (a sidecar divergence). the flatten + cascade overwrites both route through the guard

// flatten host (declaration): a `/`-leading lifted SE after a `;`-less `i++`
i++
const { Array: { from } } = (/x/.test(s), globalThis);

// cascade host (assignment): a `+`-leading lifted SE after a `;`-less `i--`, distinct static
let m;
i--
({ Map: { groupBy: m } } = (+log(), globalThis));
