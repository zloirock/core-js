// IIFE with BlockStatement body containing a single ReturnStatement -- distinct from the
// arrow-expression-body shape. `singleReturnExpr` helper extracts the conditional from
// `return cond ? Array : Iterator;` and feeds it to the fallback meta walker. covers
// formatter-emitted block-body arrows (prettier expands single-expr arrows to block-return).
const { from } = (() => { return cond ? Array : Iterator; })();
from([1, 2]);
