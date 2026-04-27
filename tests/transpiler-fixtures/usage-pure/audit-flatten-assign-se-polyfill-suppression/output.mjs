import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// SE-prefix in destructure assignment expression. tryFlattenAssignmentExpression uses
// walkAstNodes to seed skippedNodes for the assignment receiver - if the walk blanket-
// covers the SE-prefix's Identifiers, Promise.resolve gets suppressed and _Promise$resolve
// import never emits. expected: both _Promise$resolve AND _Array$from imports
let from;
_Promise$resolve(0).then(noop);
from = _Array$from;