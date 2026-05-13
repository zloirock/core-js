// Removing the entry import must not fuse the `[` of the next array-literal-LHS line
// onto the previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because
// the prev statement ended without semicolon AND the user did not prepend their own guard.
var x = 1
import 'core-js/actual/array/from'
[1, 2, 3].forEach(n => x = n)
