// an assignment-destructure in CALL-ARG position: identification must use the broad host
// predicate - gating it on the flatten-emit predicate (ExpressionStatement-only) dropped the
// es.array.from injection while the text stays verbatim and reads the native static at runtime
let from;
const capture = x => x;
capture(({ Array: { from } } = globalThis));
from([1, 2]);
