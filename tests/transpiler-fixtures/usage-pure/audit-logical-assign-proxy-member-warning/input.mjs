// MemberExpression LHS of logical-assignment - `globalThis.Map ||= X` case separate
// from bare Identifier (`Map ||= X`). checkLogicalAssignLhsMember fires on enter of
// the MemberExpression before inner-identifier visit rewrites `globalThis` to
// `_globalThis`; captures the pre-transform name for a user-friendly warning
globalThis.Symbol ||= {};
globalThis.WeakMap ||= {};
