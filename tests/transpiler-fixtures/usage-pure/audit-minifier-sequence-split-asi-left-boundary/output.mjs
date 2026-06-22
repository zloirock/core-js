import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A minifier-collapsed sequence `(prefix, destructure)` is split into per-expression statements by the
// shared pre-pass, then the destructure is polyfilled. The detected statement starts with `(`, which
// ASI-splits a postfix `++` / `--` prev (`UpdateExpression Arguments` is a SyntaxError), but the split's
// FIRST product re-roots the line on a hazard char: `+eff()` fuses SILENTLY into `i++ + eff()` (one
// statement); `/re/.test(...)` fuses into a parse error that makes the re-parse ABANDON the split, leaving
// the destructure un-split. The left-boundary guard injects the `;` so the products stay separate and the
// re-parse keeps the split - the same guard the entry SE-prefix rewrite and the removal path use
let eff = () => {};
let from,
  of2,
  i = 0,
  n = 0;
i++;
+eff();
from = _Array$from;
n--;
/r/.test(eff());
of2 = _Array$of;
export { from, of2 };