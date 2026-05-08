import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// nested proxy-global destructure with a comma-expression init: `(se(), globalThis)`.
// non-nested `{from} = (se(), Array)` already lifts the prefix and flattens; nested
// chain must match that parity - peel through parens + comma, extract side effects as a
// standalone statement, emit `const from = _Array$from` from the flattened receiver
function se() {
  return _globalThis;
}
se();
const from = _Array$from;
from([1, 2]);