import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Removing the entry import must not fuse the `[` of the next array-literal-LHS line
// onto the previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because
// the prev statement ended without semicolon AND the user did not pre-pend their own guard.
var x = 1
;[1, 2, 3].forEach(n => x = n)
