// `cond ? (Array) : (Iterator)` - parens preserved around each branch identifier.
// Per-branch viability check peels parens and TS wrappers so each branch identifier
// reaches the receiver classifier and contributes its polyfill independently - the
// paren-wrapped right of a `||` whose left decides nothing too; `Array || (Set)` folds
export const { from: a } = (cond ? (Array) : (Iterator));
export const { values: b } = (Array || (Set));
export const { isInteger: c } = (globalThis.WeakRef || (Number));
