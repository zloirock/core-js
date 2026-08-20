// a BRANCHING alias init registers only when every completing path yields the global.
// negatives: a mixed ternary, a reversed `||` (the left operand wins when truthy) and an
// `&&` (its falsy path yields the left operand) - the member reads stay native and keep
// their TypeError on the non-global path; the branch substitutions stay value-correct
const cond = Math.random() > 2;

var { Map: M1 } = cond ? globalThis : { Map: null };
export const viaMixedTernary = cond && M1.groupBy(['a'], (x) => x);

const fake = { Map: null };
var { Map: M2 } = fake || globalThis;
export const viaReversedOr = typeof M2;

var { Map: M3 } = cond && globalThis;
export const viaAnd = cond && M3.groupBy(['b'], (x) => x);

// defaulted forms keep folding: the fallback only runs where the global is absent
var { Map: M4 } = typeof globalThis === 'undefined' ? { Map: null } : globalThis;
export const viaDefaultedTernary = M4.groupBy(['c'], (x) => x);

var { Map: M5 } = globalThis ?? fake;
export const viaDefaultedNullish = M5.groupBy(['d'], (x) => x);
