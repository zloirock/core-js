import _Array$from from "@core-js/pure/actual/array/from";
// SE prefix wrapped in a TS cast on a destructure init `(logCall(), globalThis) as any`:
// the SE-prefix lift must peel through the TS wrapper, otherwise the destructure flatten
// silently drops `logCall()` from the output. peeling parens-only would have missed the
// TSAsExpression layer and the call would be lost
declare function logCall(): void;
logCall();
const from = _Array$from;
from([1, 2, 3]);