// minifier-shape paren + SequenceExpression wrapping a destructure-assignment:
// `(0, ({from} = Array));` parses as ExpressionStatement > SequenceExpression >
// AssignmentExpression. without a pre-pass split the destructure-emitter's gate
// peels only Paren+TS up to the host, leaves the SE intermediate in place, and
// silently bails on the rewrite. the Program-enter pre-pass splits the
// SequenceExpression into consecutive ExpressionStatements (`0; ({from} = Array);`)
// so the standard destructure flow handles the inner assignment and the static
// `Array.from` reference picks up its polyfill import
let from;
(0, ({ from } = Array));
from([1, 2, 3]);
