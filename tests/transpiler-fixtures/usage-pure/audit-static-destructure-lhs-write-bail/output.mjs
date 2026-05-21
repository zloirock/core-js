// `[Array.from] = [...]` puts a polyfillable static member in array-destructure-assignment
// LHS position. user is committing to monkey-patch the global - subsequent `Array.from(...)`
// reads must hit the user's reassignment, NOT the polyfill import. plugin tracks any write
// context for a polyfillable static and disables both substitution and emission for that
// member key across the file, so the read on line 2 stays as `Array.from(...)` semantically
// equivalent to the original. babel + unplugin share this gate (`isMemberWriteOnlyContext`
// detects ArrayExpression-as-LHS, plus pure-assignment / pattern shapes)
[Array.from] = [() => []];
Array.from([1, 2, 3]);