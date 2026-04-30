import _Array$from from "@core-js/pure/actual/array/from";
// SE prefix bails fallback receiver peel: `(logCall(), Array)` is a SequenceExpression
// with side-effecting prefix; peelFallbackReceiver bails (without bail SE would silently
// elide). param-default rewrite path must NOT extract Array as receiver here
(b = (logCall(), Array));
const from = _Array$from;
from;