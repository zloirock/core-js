import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// `cond ? (Array) : (Iterator)` - oxc preserves paren around each branch identifier.
// strict Identifier check in `isViableBranchForKey` rejected ParenthesizedExpression-wrapped
// branches and silently bailed - need to peel paren+TS wrappers around branches too
export const { from: a } = (cond ? { from: _Array$from } : { from: _Iterator$from });
export const { values: b } = (Array || _Set);