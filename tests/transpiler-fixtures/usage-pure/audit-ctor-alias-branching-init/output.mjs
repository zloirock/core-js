import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a BRANCHING alias init registers only when every completing path yields the global.
// negatives: a mixed ternary, a reversed `||` (the left operand wins when truthy) and an
// `&&` (its falsy path yields the left operand) - the member reads stay native and keep
// their TypeError on the non-global path; the branch substitutions stay value-correct
const cond = Math.random() > 2;
var {
  Map: M1
} = cond ? {
  Map: _Map
} : {
  Map: null
};
export const viaMixedTernary = cond && M1.groupBy(['a'], x => x);
const fake = {
  Map: null
};
var {
  Map: M2
} = fake || {
  Map: _Map
};
export const viaReversedOr = typeof M2;
var {
  Map: M3
} = cond && {
  Map: _Map
};
export const viaAnd = cond && M3.groupBy(['b'], x => x);

// defaulted forms keep folding: the fallback only runs where the global is absent
var {
  Map: M4
} = typeof _globalThis === 'undefined' ? {
  Map: null
} : {
  Map: _Map
};
export const viaDefaultedTernary = _Map$groupBy(['c'], x => x);
var M5 = _Map;
export const viaDefaultedNullish = _Map$groupBy(['d'], x => x);