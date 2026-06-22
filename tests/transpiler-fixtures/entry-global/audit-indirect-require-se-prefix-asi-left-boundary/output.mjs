import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// An indirect-require SE prefix whose REWRITTEN first char fuses into a `;`-less prev statement. A
// postfix `++` / `--` prev ASI-splits from the detected node's ORIGINAL leading `(` (the spec bans
// `UpdateExpression Arguments`), but the rewritten prefix re-roots the line: `/re/.test(spy())` starts on
// `/` and fuses into `i++ / re / .test(...)` (a parse error); `+spy()` fuses silently into `n-- + spy()`.
// the left-boundary guard injects the `;` the removal path already injects for the same hazard chars
function spy() {}
i++;
/re/.test(spy());
n--;
+spy();