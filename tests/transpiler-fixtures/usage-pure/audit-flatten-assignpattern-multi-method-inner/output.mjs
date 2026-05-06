import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// Multi-method inner pattern wrapped in AssignmentPattern: `{ Array: { from, of } = {} }`.
// Single AssignmentPattern wraps the inner ObjectPattern containing two static-method
// extractions. Wrapper peel happens once at the innermost level; willRemoveDeclarator
// holds (every level has exactly one outer prop and the inner has both methods consumed),
// so the declarator collapses to two separate `const from = _Array$from; const of = _Array$of`
const of = _Array$of;
from('hi');
of(1, 2);