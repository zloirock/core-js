import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// nested proxy-global destructure with a SequenceExpression init: `(se(), globalThis)`.
// non-nested `{from} = (se(), Array)` already lifts the SE prefix and flattens; nested
// chain must match that parity - peel through parens + sequence, extract SE as standalone
// statement, emit `const from = _Array$from` from the flattened receiver
function se() {
  return _globalThis;
}
se();
const from = _Array$from;
from([1, 2]);