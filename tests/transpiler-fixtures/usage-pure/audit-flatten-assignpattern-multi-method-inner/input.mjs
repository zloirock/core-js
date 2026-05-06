// Multi-method inner pattern wrapped in AssignmentPattern: `{ Array: { from, of } = {} }`.
// Single AssignmentPattern wraps the inner ObjectPattern containing two static-method
// extractions. Wrapper peel happens once at the innermost level; willRemoveDeclarator
// holds (every level has exactly one outer prop and the inner has both methods consumed),
// so the declarator collapses to two separate `const from = _Array$from; const of = _Array$of`
const { Array: { from, of } = {} } = globalThis;
from('hi');
of(1, 2);
