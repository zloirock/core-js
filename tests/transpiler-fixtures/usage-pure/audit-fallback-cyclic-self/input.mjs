// SE prefix in a fallback receiver: `(logCall(), Array)` is a SequenceExpression with a
// side-effecting prefix. the peel is unconditional, but the apply phase keeps the SE-bearing
// chain-assign receiver as a discarded statement so `logCall()` is preserved; the param-default
// rewrite must NOT extract Array as the receiver here
const { from } = (b = (logCall(), Array));
from;
