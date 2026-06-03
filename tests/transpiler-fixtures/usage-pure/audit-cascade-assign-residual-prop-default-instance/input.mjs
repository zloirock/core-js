// AssignmentExpression cascade flatten with a residual sibling whose default holds an
// instance call. the cascade emits `from = _Array$from` after the rebuilt destructure; the
// residual `other` default `[7].includes(8)` must still polyfill in place (the cascade LHS
// skip used to blanket-suppress the whole pattern, dropping the `_includesMaybeArray` rewrite)
let from, other;
({ Array: { from }, other = [7].includes(8) } = globalThis);
from([9]);
other;
