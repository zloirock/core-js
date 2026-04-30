import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Removing the entry import shouldn't fuse the `[` of the next array-literal-LHS line
// to the previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because
// the previous statement ended without semicolon.
var x = 1;
[1, 2, 3].forEach(n => x = n);