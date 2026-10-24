import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `(Array as any)?.from(...)` - the TS wrapper strip walks the parent chain through
// TSAsExpression + ParenthesizedExpression, then the optional-call deopt overrides the
// emit slot at callee level. lock the composite: TS strip + paren peel + `?.` deopt all
// converging. uses Array.from AND Promise.resolve to prove it composes for distinct statics.
const xs = _Array$from([1, 2, 3]);
const p = _Promise$resolve('ok');
xs;
p;