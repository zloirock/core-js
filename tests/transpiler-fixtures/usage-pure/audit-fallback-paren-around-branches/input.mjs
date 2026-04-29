// `cond ? (Array) : (Iterator)` - parens preserved around each branch identifier.
// Per-branch viability check peels parens and TS wrappers so each branch identifier
// reaches the receiver classifier and contributes its polyfill independently
export const { from: a } = (cond ? (Array) : (Iterator));
export const { values: b } = (Array || (Set));
