import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A destructure whose receiver is a SE-bearing sequence (`(+eff(), Array)`) lifts the prefix SE to a
// standalone statement before the rewritten destructure. The detected statement starts with `(` (assign)
// or `let` (decl) - both ASI-split a postfix `++` / `--` prev - but the lifted SE re-roots the line on a
// hazard char: `+eff()` fuses SILENTLY into `i++ + eff()`; `/re/.test(...)` fuses into a parse error. The
// left-boundary guard (shared with the minifier split) injects the `;` so the lifted SE stays separate
let eff = () => {};
let from,
  i = 0,
  n = 0;
i++;
+eff();
from = _Array$from;
n--;
/r/.test(eff());
let of2 = _Array$of;
export { from, of2 };