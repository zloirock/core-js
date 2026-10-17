// const-decl with conditional init AND rest in pattern: `{from, ...rest} = cond ?
// Array : Iterator`. rest disqualifies per-branch synth-swap (would lose runtime
// exclusion semantics); plain branch identifiers still polyfill independently
const { from, ...rest } = cond ? Array : Iterator;
export { from, rest };
