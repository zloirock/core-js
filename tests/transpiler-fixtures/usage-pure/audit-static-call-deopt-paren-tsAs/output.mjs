import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `(Array as any)?.from(...)` - replaceGlobalOrStatic's TS wrapper strip walks
// metaPath.parentPath through TSAsExpression + ParenthesizedExpression, then the
// optional-call deopt branch overrides start/end at parent.callee level. lock the
// composite: TS wrapper strip + paren peel + `?.` deopt all converging on the same
// emit slot. uses Array.from for the static path AND Promise.resolve to prove the
// pattern composes for distinct polyfilled statics
const xs = _Array$from([1, 2, 3]);
const p = _Promise$resolve('ok');
xs;
p;