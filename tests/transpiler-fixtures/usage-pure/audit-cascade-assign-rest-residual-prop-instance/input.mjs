// AssignmentExpression cascade flatten with BOTH a rest sibling and a residual sibling whose
// default holds an instance call. the consumed `Array` key becomes a `_unused` rest sentinel
// (rest exclusion preserved), `from = _Array$from` is emitted after the destructure, and the
// residual `mapped` default `[10].flatMap(String)` must still polyfill in place
let from, mapped, others;
({ Array: { from }, mapped = [10].flatMap(String), ...others } = globalThis);
from([11]);
mapped;
