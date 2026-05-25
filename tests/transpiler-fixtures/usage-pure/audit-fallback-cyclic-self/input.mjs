// SE prefix bails fallback receiver peel: `(logCall(), Array)` is a SequenceExpression
// with side-effecting prefix; fallback-receiver peel bails (without bail SE would silently
// elide). param-default rewrite path must NOT extract Array as receiver here
const { from } = (b = (logCall(), Array));
from;
