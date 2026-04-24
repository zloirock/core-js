// nested proxy-global destructure with a SequenceExpression init: `(se(), globalThis)`.
// non-nested `{from} = (se(), Array)` already lifts the SE prefix and flattens; nested
// chain must match that parity - peel through parens + sequence, extract SE as standalone
// statement, emit `const from = _Array$from` from the flattened receiver
function se() { return globalThis; }
const { Array: { from } } = (se(), globalThis);
from([1, 2]);
