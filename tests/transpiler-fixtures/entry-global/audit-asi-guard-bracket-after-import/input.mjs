// Removing the entry import shouldn't fuse the `[` of the next array-literal-LHS line
// to the previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because
// the previous statement ended without semicolon.
var x = 1
import 'core-js/actual/array/from'
;[1, 2, 3].forEach(n => x = n)
