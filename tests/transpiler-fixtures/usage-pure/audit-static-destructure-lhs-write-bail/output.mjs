// `[Array.from] = [...]` puts a polyfillable static member in array-destructure-assignment
// LHS position. user monkey-patches the global - subsequent `Array.from(...)` reads must
// hit the user's reassignment, NOT the polyfill import. any write context for a polyfillable
// static disables both substitution and emission for that member key across the file
[Array.from] = [() => []];
Array.from([1, 2, 3]);