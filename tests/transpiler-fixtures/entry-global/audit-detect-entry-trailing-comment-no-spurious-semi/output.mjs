import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Removed entry import surrounded by trailing line comment + following statement
// starting with `(`. backward-scan from the removed import must skip the line comment
// to see the preceding `;` and decide ASI guard is not needed. without the comment-aware
// scan, the scanner lands inside `// trailing` chars, doesn't see `;`, and injects a
// spurious `;` before `(fn)()`.
var x = 1; // trailing

fn();