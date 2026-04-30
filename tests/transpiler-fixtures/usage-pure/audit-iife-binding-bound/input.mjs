// const-bound arrow callee: inlineCallReturnExpression follows the binding's init.
// Verifies receiver opacity through identifier-bound arrow IIFE.
const fn = () => [1, 2, 3];
fn().at(0);
