// `cond ? (Array) : (Iterator)` - oxc preserves paren around each branch identifier.
// strict Identifier check in `isViableBranchForKey` rejected ParenthesizedExpression-wrapped
// branches and silently bailed - need to peel paren+TS wrappers around branches too
export const { from: a } = (cond ? (Array) : (Iterator));
export const { values: b } = (Array || (Set));
