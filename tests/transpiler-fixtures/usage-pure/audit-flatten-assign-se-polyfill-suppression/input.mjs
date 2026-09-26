// side-effect-prefix in destructure assignment expression. the assignment-flattener uses
// the AST walker to seed skipped nodes for the assignment receiver - if the walk blanket-
// covers the prefix's identifiers, Promise.resolve gets suppressed and _Promise$resolve
// import never emits. expected: both _Promise$resolve AND _Array$from imports
let from;
({ Array: { from } } = (Promise.resolve(0).then(noop), globalThis));
