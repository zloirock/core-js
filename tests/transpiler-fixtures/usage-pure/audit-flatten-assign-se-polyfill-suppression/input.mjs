// SE-prefix in destructure assignment expression. tryFlattenAssignmentExpression uses
// walkAstNodes to seed skippedNodes for the assignment receiver - if the walk blanket-
// covers the SE-prefix's Identifiers, Promise.resolve gets suppressed and _Promise$resolve
// import never emits. expected: both _Promise$resolve AND _Array$from imports
let from;
({ Array: { from } } = (Promise.resolve(0).then(noop), globalThis));
