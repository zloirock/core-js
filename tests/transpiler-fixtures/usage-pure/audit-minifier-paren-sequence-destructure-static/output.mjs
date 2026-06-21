import _Array$from from "@core-js/pure/actual/array/from";
// minifier-shape paren + SequenceExpression wrapping a destructure-assignment:
// `(0, ({from} = Array));` parses as ExpressionStatement > SequenceExpression >
// AssignmentExpression. the destructure rewrite only peels Paren+TS up to the host and
// silently bails on the SE intermediate, so a pre-pass must split the SequenceExpression into
// consecutive ExpressionStatements (`0; ({from} = Array);`) before the static `Array.from` polyfills
let from;
0;
from = _Array$from;
from([1, 2, 3]);